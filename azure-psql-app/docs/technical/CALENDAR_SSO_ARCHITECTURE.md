# Calendar, Meeting & SSO Architecture

## Overview

This document outlines the architecture for extending the Notes App with:
- **Single Sign-On (SSO)** authentication
- **Calendar synchronization** with external providers
- **Meeting scheduling** and management
- **Room booking** system
- **User management** with role-based access control

---

## 1. SSO Authentication Architecture

### Supported SSO Providers

| Provider | Protocol | Use Case |
|----------|----------|----------|
| **Azure AD** | OAuth 2.0 / OpenID Connect | Enterprise Microsoft 365 integration |
| **Google Workspace** | OAuth 2.0 / OpenID Connect | Google Calendar, Gmail integration |
| **Okta** | SAML 2.0 / OpenID Connect | Enterprise SSO |
| **Auth0** | OAuth 2.0 / OpenID Connect | Universal identity platform |

### Authentication Flow

```
┌─────────┐         ┌──────────┐         ┌─────────────┐
│ Browser │         │   App    │         │ SSO Provider│
└────┬────┘         └────┬─────┘         └──────┬──────┘
     │                   │                       │
     │  1. Login Request │                       │
     ├──────────────────>│                       │
     │                   │                       │
     │  2. Redirect to SSO                       │
     ├───────────────────┴──────────────────────>│
     │                                            │
     │  3. User authenticates                     │
     │  (username/password/MFA)                   │
     │<───────────────────────────────────────────┤
     │                                            │
     │  4. Authorization code                     │
     ├───────────────────┬───────────────────────>│
     │                   │                        │
     │                   │  5. Exchange code      │
     │                   │     for tokens         │
     │                   ├───────────────────────>│
     │                   │                        │
     │                   │  6. Access token +     │
     │                   │     ID token           │
     │                   │<───────────────────────┤
     │                   │                        │
     │  7. Set session   │                        │
     │     cookie        │                        │
     │<──────────────────┤                        │
     │                   │                        │
```

### Database Schema for Users

```sql
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── sso_provider (VARCHAR) - 'azure-ad', 'google', etc.
├── sso_provider_id (VARCHAR) - Unique ID from provider
├── sso_tenant_id (VARCHAR) - For multi-tenant (Azure AD)
├── display_name, first_name, last_name
├── avatar_url
├── timezone, language, preferences
└── created_at, updated_at, last_login_at

user_sessions
├── id (UUID, PK)
├── user_id (FK -> users)
├── access_token (TEXT) - Encrypted OAuth token
├── refresh_token (TEXT) - For token renewal
├── session_token (VARCHAR) - Browser cookie
└── expires_at, ip_address, user_agent
```

---

## 2. Calendar Integration Architecture

### External Calendar Providers

```javascript
const CALENDAR_PROVIDERS = {
  GOOGLE: {
    name: 'Google Calendar',
    oauth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/calendar'],
    api_endpoint: 'https://www.googleapis.com/calendar/v3'
  },
  OUTLOOK: {
    name: 'Microsoft Outlook',
    oauth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: ['https://graph.microsoft.com/Calendars.ReadWrite'],
    api_endpoint: 'https://graph.microsoft.com/v1.0/me/calendar'
  }
};
```

### Calendar Sync Flow

```
┌──────────────┐         ┌───────────┐         ┌──────────────┐
│ Notes App DB │         │   Sync    │         │ External API │
└──────┬───────┘         │  Service  │         └──────┬───────┘
       │                 └─────┬─────┘                │
       │                       │                      │
       │  1. Fetch last sync   │                      │
       │<──────────────────────┤                      │
       │                       │                      │
       │                       │  2. Get events since │
       │                       │     last sync        │
       │                       ├─────────────────────>│
       │                       │                      │
       │                       │  3. Return events    │
       │                       │<─────────────────────┤
       │                       │                      │
       │  4. Merge & update    │                      │
       │<──────────────────────┤                      │
       │                       │                      │
       │  5. Push local changes│                      │
       │──────────────────────>│─────────────────────>│
       │                       │                      │
       │  6. Update sync time  │                      │
       │<──────────────────────┤                      │
       │                       │                      │
```

### Database Schema for Calendar

```sql
calendar_events
├── id (UUID, PK)
├── user_id (FK -> users)
├── title, description, location
├── start_time, end_time (TIMESTAMPTZ)
├── timezone, is_all_day
├── recurrence_rule (iCalendar RRULE)
├── event_type ('event', 'meeting', 'reminder')
├── external_calendar_id (VARCHAR) - ID from Google/Outlook
├── calendar_provider_id (FK -> calendar_providers)
└── sync_status ('synced', 'pending', 'conflict')

event_attendees
├── id (UUID, PK)
├── event_id (FK -> calendar_events)
├── user_id (FK -> users)
├── email, display_name
├── status ('accepted', 'declined', 'tentative')
└── is_organizer, is_required
```

---

## 3. Meeting Scheduling System

### Meeting Booking Flow

```
User Story: Book a conference room for team standup

1. User selects date/time (Monday 9:00-9:30 AM)
2. System checks available rooms:
   - Filters by capacity (>= 10 people)
   - Filters by features (needs "video-conference")
   - Checks availability in time slot
3. User selects "Conference Room A"
4. User adds participants (team members)
5. System creates:
   - meeting_bookings record
   - calendar_event record
   - Sends invitations to participants
   - Syncs to external calendars
6. Participants receive email/push notifications
7. They accept/decline via app or calendar
```

### Room Booking Algorithm

```javascript
// Pseudo-code for room availability check
function findAvailableRooms(startTime, endTime, capacity, features) {
  return db.query(`
    SELECT r.*
    FROM meeting_rooms r
    WHERE r.is_active = true
      AND r.capacity >= ?
      AND r.features @> ?  -- JSONB contains check
      AND NOT EXISTS (
        SELECT 1 FROM meeting_bookings mb
        WHERE mb.room_id = r.id
          AND mb.status = 'scheduled'
          AND mb.start_time < ?
          AND mb.end_time > ?
      )
    ORDER BY r.capacity ASC, r.name ASC
  `, [capacity, features, endTime, startTime]);
}
```

### Database Schema for Meetings

```sql
meeting_rooms
├── id (UUID, PK)
├── name, location, building, floor
├── capacity (INTEGER)
├── features (JSONB) - ["projector", "whiteboard", "video"]
├── equipment (JSONB) - {"monitors": 2, "chairs": 10}
├── working_hours (JSONB) - Business hours by day
└── min/max_booking_minutes, booking_increment

meeting_bookings
├── id (UUID, PK)
├── title, description, agenda
├── start_time, end_time (TIMESTAMPTZ)
├── room_id (FK -> meeting_rooms)
├── organizer_id (FK -> users)
├── meeting_type ('in-person', 'virtual', 'hybrid')
├── virtual_meeting_url (Zoom/Teams link)
├── status ('scheduled', 'started', 'completed', 'cancelled')
├── calendar_event_id (FK -> calendar_events)
└── send_reminder, reminder_minutes_before

meeting_participants
├── id (UUID, PK)
├── meeting_id (FK -> meeting_bookings)
├── user_id (FK -> users)
├── status ('invited', 'accepted', 'declined')
├── is_required, is_presenter
└── checked_in, checked_in_at
```

---

## 4. Integration with Notes

### Linking Notes to Calendar & Meetings

Users can link notes to calendar events and meetings for context:

```sql
-- Link note to calendar event
note_calendar_links
├── note_id (FK -> notes)
├── event_id (FK -> calendar_events)
└── linked_by (FK -> users)

-- Link note to meeting
note_meeting_links
├── note_id (FK -> notes)
├── meeting_id (FK -> meeting_bookings)
└── linked_by (FK -> users)

-- Meeting minutes
meeting_minutes
├── id (UUID, PK)
├── meeting_id (FK -> meeting_bookings)
├── minutes (TEXT)
├── action_items (JSONB)
├── decisions (JSONB)
└── created_by (FK -> users)
```

**Use Cases:**
- Attach meeting agenda notes before a meeting
- Link meeting minutes after a meeting
- Attach research notes to calendar events
- Link task notes to action items from meetings

---

## 5. API Endpoints Design

### Authentication Endpoints

```javascript
// SSO Authentication
POST   /api/auth/login/:provider        // Initiate SSO login
GET    /api/auth/callback/:provider     // OAuth callback
POST   /api/auth/logout                 // Logout user
GET    /api/auth/me                     // Get current user
POST   /api/auth/refresh                // Refresh access token
```

### Calendar Endpoints

```javascript
// Calendar Events
GET    /api/calendar/events                    // List user's events
POST   /api/calendar/events                    // Create event
GET    /api/calendar/events/:id                // Get event details
PUT    /api/calendar/events/:id                // Update event
DELETE /api/calendar/events/:id                // Delete event
GET    /api/calendar/events/range/:start/:end  // Events in date range

// Calendar Sync
POST   /api/calendar/providers                 // Connect calendar provider
GET    /api/calendar/providers                 // List connected calendars
DELETE /api/calendar/providers/:id             // Disconnect calendar
POST   /api/calendar/sync                      // Trigger manual sync
GET    /api/calendar/sync/status               // Get sync status
```

### Meeting Endpoints

```javascript
// Meetings
GET    /api/meetings                           // List meetings
POST   /api/meetings                           // Schedule meeting
GET    /api/meetings/:id                       // Get meeting details
PUT    /api/meetings/:id                       // Update meeting
DELETE /api/meetings/:id                       // Cancel meeting
POST   /api/meetings/:id/participants          // Add participant
PUT    /api/meetings/:id/participants/:pid     // Update attendance
POST   /api/meetings/:id/checkin               // Check in to meeting

// Rooms
GET    /api/rooms                              // List all rooms
GET    /api/rooms/available                    // Find available rooms
GET    /api/rooms/:id                          // Get room details
GET    /api/rooms/:id/schedule                 // Room schedule
POST   /api/rooms/:id/book                     // Book room

// Meeting Minutes
GET    /api/meetings/:id/minutes               // Get minutes
POST   /api/meetings/:id/minutes               // Create minutes
PUT    /api/meetings/:id/minutes               // Update minutes
```

### Integration Endpoints

```javascript
// Link notes to calendar/meetings
POST   /api/notes/:id/link-event/:eventId      // Link note to event
POST   /api/notes/:id/link-meeting/:meetingId  // Link note to meeting
DELETE /api/notes/:id/unlink-event/:eventId    // Unlink from event
DELETE /api/notes/:id/unlink-meeting/:meetingId // Unlink from meeting
```

---

## 6. Frontend UI Components

### New Pages/Views to Create

```
src/
├── pages/
│   ├── Calendar.jsx              // Main calendar view
│   ├── MeetingScheduler.jsx      // Meeting booking interface
│   ├── RoomBooking.jsx            // Room finder & booker
│   ├── Profile.jsx                // User profile & settings
│   └── Admin/
│       ├── UserManagement.jsx     // User admin panel
│       └── RoomManagement.jsx     // Room admin panel
│
├── components/
│   ├── auth/
│   │   ├── SSOLoginButton.jsx     // SSO provider buttons
│   │   └── ProtectedRoute.jsx     // Auth guard
│   │
│   ├── calendar/
│   │   ├── CalendarView.jsx       // Month/week/day views
│   │   ├── EventCard.jsx          // Event display card
│   │   ├── EventForm.jsx          // Create/edit event
│   │   └── SyncSettings.jsx       // Calendar sync config
│   │
│   └── meetings/
│       ├── MeetingCard.jsx        // Meeting display
│       ├── RoomSelector.jsx       // Room picker with filters
│       ├── ParticipantList.jsx    // Attendee management
│       └── MeetingMinutes.jsx     // Minutes editor
```

### Calendar View Component Structure

```jsx
// CalendarView.jsx
import { Calendar } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month'); // month, week, day
  
  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const handleEventClick = (info) => {
    // Open event details modal
  };
  
  const handleDateSelect = (selectInfo) => {
    // Create new event
  };
  
  return (
    <div className="calendar-container">
      <CalendarToolbar view={view} onViewChange={setView} />
      <Calendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        select={handleDateSelect}
        selectable
        editable
      />
    </div>
  );
}
```

---

## 7. Implementation Roadmap

### Phase 1: SSO Authentication (Week 1-2)
- [ ] Set up OAuth 2.0 flow for Azure AD
- [ ] Implement user registration/login
- [ ] Create session management
- [ ] Add role-based access control
- [ ] Update existing notes to link with users

### Phase 2: Calendar Foundation (Week 3-4)
- [ ] Create calendar events CRUD
- [ ] Build calendar UI (month/week/day views)
- [ ] Implement event attendees
- [ ] Add event reminders/notifications

### Phase 3: External Calendar Sync (Week 5-6)
- [ ] Google Calendar API integration
- [ ] Outlook/Microsoft Graph integration
- [ ] Build sync service (cron job)
- [ ] Handle conflict resolution

### Phase 4: Meeting Scheduling (Week 7-8)
- [ ] Create room management system
- [ ] Build meeting booking flow
- [ ] Add participant management
- [ ] Virtual meeting integration (Zoom/Teams)

### Phase 5: Meeting Enhancements (Week 9-10)
- [ ] Meeting minutes/notes
- [ ] Check-in system
- [ ] Meeting analytics
- [ ] Room availability heatmaps

### Phase 6: Integration & Polish (Week 11-12)
- [ ] Link notes to events/meetings
- [ ] Email notifications
- [ ] Push notifications
- [ ] Mobile responsiveness
- [ ] Performance optimization

---

## 8. Technology Stack

### Backend
```javascript
{
  "authentication": "Passport.js with OAuth 2.0",
  "calendar_sync": "node-cron for scheduled sync",
  "email": "SendGrid or AWS SES",
  "push_notifications": "Firebase Cloud Messaging",
  "virtual_meetings": "Zoom SDK / Microsoft Teams Graph API"
}
```

### Frontend
```javascript
{
  "calendar_ui": "@fullcalendar/react or react-big-calendar",
  "date_handling": "date-fns or dayjs",
  "form_management": "react-hook-form",
  "state_management": "React Context or Redux Toolkit",
  "notifications": "react-toastify"
}
```

### External APIs
- **Google Calendar API** - Calendar sync
- **Microsoft Graph API** - Outlook calendar, Teams meetings
- **Zoom API** - Virtual meeting creation
- **SendGrid** - Email notifications

---

## 9. Security Considerations

### Data Protection
- Encrypt OAuth tokens at rest (AES-256)
- Use HTTPS for all API communications
- Implement CSRF protection
- Rate limiting on auth endpoints

### Access Control
- Role-based permissions (admin, manager, user, guest)
- Resource-level permissions (own notes, shared notes)
- Meeting room access control
- Calendar visibility settings (public, private, confidential)

### Compliance
- GDPR compliance for user data
- Data retention policies
- Audit logs for sensitive operations
- User consent for calendar access

---

## 10. Example Usage Scenarios

### Scenario 1: New User Onboarding
```
1. User clicks "Sign in with Microsoft"
2. Redirected to Azure AD login
3. User authenticates with company credentials
4. Returns to app with user profile
5. System creates user record
6. Assigns default "user" role
7. Prompts to connect calendar (optional)
8. User dashboard shows welcome message
```

### Scenario 2: Schedule Team Meeting
```
1. User clicks "Schedule Meeting"
2. Fills form:
   - Title: "Sprint Planning"
   - Date: Next Monday 2:00 PM
   - Duration: 2 hours
   - Participants: @john, @sarah, @mike
3. Clicks "Find Room"
4. System shows available rooms with capacity >= 4
5. User selects "Conference Room B"
6. Adds video conference link (Zoom auto-generated)
7. Clicks "Send Invitations"
8. System:
   - Creates meeting booking
   - Blocks room on calendar
   - Sends email to participants
   - Syncs to everyone's Google/Outlook calendar
9. Participants receive notification and accept
```

### Scenario 3: Link Notes to Meeting
```
1. User has upcoming meeting "Q4 Strategy Review"
2. Creates note with agenda items
3. Clicks "Link to Meeting" button
4. Selects "Q4 Strategy Review" from dropdown
5. Note now appears in meeting details
6. During meeting, opens note to reference
7. After meeting, creates new note "Meeting Minutes"
8. Links to same meeting
9. Both notes visible in meeting history
```

---

## 11. Monitoring & Analytics

### Metrics to Track
- Daily/monthly active users
- Calendar sync success rate
- Meeting booking patterns
- Room utilization rates
- Average meeting duration
- No-show rates
- Most popular meeting times

### Dashboards
- Admin dashboard: User activity, system health
- Manager dashboard: Team meeting analytics
- User dashboard: Personal calendar insights

---

## Conclusion

This architecture provides a comprehensive foundation for transforming the Notes App into a full-featured productivity platform with calendar, meetings, and collaboration features. The phased implementation approach allows for iterative development while maintaining system stability.

**Next Steps:**
1. Review and approve architecture
2. Set up development environment
3. Begin Phase 1 (SSO Authentication)
4. Create frontend mockups/wireframes
5. Set up external API accounts (Google, Microsoft)

