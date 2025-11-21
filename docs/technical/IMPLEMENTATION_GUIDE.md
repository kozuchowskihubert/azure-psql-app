# Implementation Guide: Calendar, Meetings & SSO

## Quick Start Summary

This guide provides step-by-step instructions for implementing the calendar, meeting scheduling, room booking, and SSO authentication features in your Notes App.

---

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Backend Configuration](#backend-configuration)
3. [SSO Provider Setup](#sso-provider-setup)
4. [API Integration](#api-integration)
5. [Frontend Implementation](#frontend-implementation)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## 1. Database Setup

### Step 1.1: Run the Schema Extension

```bash
# Connect to your PostgreSQL database
psql -h your-postgresql-server.postgres.database.azure.com \
     -U your-db-user \
     -d notesdb \
     -f infra/schema-extensions.sql
```

This creates all the necessary tables for:
- User management with SSO
- Calendar events
- Meeting bookings
- Room management
- Notifications

### Step 1.2: Verify Tables Created

```sql
-- List all new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'user_sessions', 'user_roles', 
    'calendar_events', 'meeting_bookings', 'meeting_rooms'
  );
```

### Step 1.3: Insert Sample Data (Optional)

```sql
-- Create sample meeting rooms
INSERT INTO meeting_rooms (name, location, capacity, features, equipment) VALUES
  ('Conference Room A', 'Building 1, Floor 2', 10, 
   '["projector", "whiteboard", "video-conference"]'::jsonb,
   '{"monitors": 2, "chairs": 10, "tables": 1}'::jsonb),
  ('Small Meeting Room', 'Building 1, Floor 1', 4,
   '["whiteboard"]'::jsonb,
   '{"chairs": 4, "tables": 1}'::jsonb),
  ('Executive Boardroom', 'Building 2, Floor 5', 20,
   '["projector", "video-conference", "phone", "whiteboard"]'::jsonb,
   '{"monitors": 3, "chairs": 20, "tables": 2}'::jsonb);
```

---

## 2. Backend Configuration

### Step 2.1: Install Dependencies

```bash
cd app

npm install passport \
           passport-azure-ad \
           passport-google-oauth20 \
           express-session \
           @sendgrid/mail \
           node-cron \
           jsonwebtoken
```

### Step 2.2: Set Up Environment Variables

```bash
# Copy template
cp ../.env.template ../.env

# Edit .env and fill in your credentials
nano ../.env
```

### Step 2.3: Generate Encryption Key

```bash
# Generate 32-byte encryption key for token storage
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env as ENCRYPTION_KEY
```

### Step 2.4: Update Main App File

Add to `app/index.js`:

```javascript
const session = require('express-session');
const passport = require('passport');
const { initializePassport, configureSession, requireAuth } = require('./auth/sso-config');
const authRoutes = require('./auth/auth-routes');
const calendarRoutes = require('./routes/calendar-routes');
const meetingRoutes = require('./routes/meeting-routes');

// ... existing code ...

// Add before routes
app.use(configureSession());
app.use(passport.initialize());
app.use(passport.session());
initializePassport(db);

// Add routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/meetings', meetingRoutes);

// Protect existing routes
app.get('/notes', requireAuth, async (req, res) => {
  // ... existing notes code ...
  // Add: WHERE user_id = req.user.id
});
```

---

## 3. SSO Provider Setup

### 3.1 Azure AD Configuration

#### Step 1: Register Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: `Notes App`
   - Supported account types: `Accounts in any organizational directory`
   - Redirect URI: `http://localhost:3000/api/auth/callback/azure`
5. Click **Register**

#### Step 2: Configure Authentication

1. Go to **Authentication** tab
2. Add platform: **Web**
3. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/azure`
   - `https://your-app.azurewebsites.net/api/auth/callback/azure`
4. Enable **ID tokens** and **Access tokens**
5. Save

#### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Notes App Secret`
4. Expiration: Choose duration
5. Click **Add**
6. **Copy the secret value immediately** (you won't see it again!)

#### Step 4: Add API Permissions

1. Go to **API permissions**
2. Add permissions:
   - `User.Read`
   - `Calendars.ReadWrite`
   - `Calendars.ReadWrite.Shared`
3. Grant admin consent

#### Step 5: Update .env

```bash
AZURE_AD_CLIENT_ID=<Application (client) ID>
AZURE_AD_CLIENT_SECRET=<Client secret value>
AZURE_AD_TENANT_ID=common  # or your specific tenant ID
```

### 3.2 Google OAuth Configuration

#### Step 1: Create Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: `Notes App`
3. Enable APIs:
   - Google Calendar API
   - Google People API

#### Step 2: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `Notes App Web Client`
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.azurewebsites.net/api/auth/callback/google`
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

#### Step 3: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. User type: **External**
3. Fill in app information
4. Add scopes:
   - `openid`
   - `profile`
   - `email`
   - `https://www.googleapis.com/auth/calendar`
5. Add test users (for testing phase)

#### Step 4: Update .env

```bash
GOOGLE_CLIENT_ID=<Client ID>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<Client Secret>
```

---

## 4. API Integration

### 4.1 Test SSO Authentication

```bash
# Start server
npm start

# Test Azure AD login
curl http://localhost:3000/api/auth/login/azure

# Test Google login
curl http://localhost:3000/api/auth/login/google

# Check auth status
curl http://localhost:3000/api/auth/status \
  -H "Cookie: notes.sid=<session-cookie>"
```

### 4.2 Test Calendar API

```bash
# Create event
curl -X POST http://localhost:3000/api/calendar/events \
  -H "Content-Type: application/json" \
  -H "Cookie: notes.sid=<session-cookie>" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly sync",
    "startTime": "2025-11-20T10:00:00Z",
    "endTime": "2025-11-20T11:00:00Z",
    "attendees": [
      {"email": "colleague@example.com", "name": "John Doe"}
    ]
  }'

# Get events
curl http://localhost:3000/api/calendar/events \
  -H "Cookie: notes.sid=<session-cookie>"
```

### 4.3 Test Meeting Booking

```bash
# Find available rooms
curl "http://localhost:3000/api/meetings/rooms/available?startTime=2025-11-20T10:00:00Z&endTime=2025-11-20T11:00:00Z&capacity=10" \
  -H "Cookie: notes.sid=<session-cookie>"

# Schedule meeting
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -H "Cookie: notes.sid=<session-cookie>" \
  -d '{
    "title": "Sprint Planning",
    "startTime": "2025-11-20T14:00:00Z",
    "endTime": "2025-11-20T16:00:00Z",
    "roomId": "<room-uuid>",
    "participants": [
      {"email": "team@example.com", "name": "Team"}
    ]
  }'
```

---

## 5. Frontend Implementation

### 5.1 Add Login Buttons

Update `app/public/index.html`:

```html
<!-- Add to navigation bar -->
<div class="auth-buttons" id="auth-section">
  <button onclick="loginWithAzure()" class="btn-azure">
    <i class="fab fa-microsoft"></i> Sign in with Microsoft
  </button>
  <button onclick="loginWithGoogle()" class="btn-google">
    <i class="fab fa-google"></i> Sign in with Google
  </button>
</div>
```

### 5.2 Add Authentication Functions

Update `app/public/app.js`:

```javascript
// Check auth status on page load
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (data.authenticated) {
      showDashboard(data.user);
    } else {
      showLoginPage();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
}

function loginWithAzure() {
  window.location.href = '/api/auth/login/azure';
}

function loginWithGoogle() {
  window.location.href = '/api/auth/login/google';
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

// Call on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);
```

### 5.3 Add Calendar View (using FullCalendar)

```html
<!-- Add to index.html -->
<link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/main.min.css' rel='stylesheet' />
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/index.global.min.js'></script>

<div id="calendar"></div>
```

```javascript
// app.js
async function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: async function(info, successCallback) {
      const response = await fetch(
        `/api/calendar/events?start=${info.startStr}&end=${info.endStr}`
      );
      const data = await response.json();
      successCallback(data.events.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start_time,
        end: e.end_time,
      })));
    },
    eventClick: function(info) {
      showEventDetails(info.event.id);
    }
  });
  
  calendar.render();
}
```

---

## 6. Testing

### 6.1 Test SSO Login Flow

1. Navigate to `http://localhost:3000`
2. Click "Sign in with Microsoft" or "Sign in with Google"
3. Complete authentication
4. Verify redirect to dashboard
5. Check session cookie is set
6. Refresh page - should stay logged in

### 6.2 Test Calendar Features

1. Create a new event
2. Verify it appears in calendar view
3. Edit the event
4. Delete the event
5. Add attendees
6. Check notifications

### 6.3 Test Meeting Booking

1. Search for available rooms
2. Select time slot
3. Book a room
4. Add participants
5. Verify email notifications sent
6. Check calendar sync

---

## 7. Deployment

### 7.1 Update Azure App Service

```bash
# Add environment variables in Azure Portal
az webapp config appsettings set \
  --resource-group <resource-group> \
  --name <app-name> \
  --settings \
    AZURE_AD_CLIENT_ID="<client-id>" \
    AZURE_AD_CLIENT_SECRET="<secret>" \
    GOOGLE_CLIENT_ID="<client-id>" \
    GOOGLE_CLIENT_SECRET="<secret>" \
    SESSION_SECRET="<random-secret>" \
    ENCRYPTION_KEY="<32-byte-hex-key>"
```

### 7.2 Update Redirect URIs

Update in Azure AD and Google Console:
- Add production URL: `https://your-app.azurewebsites.net/api/auth/callback/*`

### 7.3 Deploy

```bash
git add .
git commit -m "feat: Add calendar, meetings, and SSO authentication"
git push origin main
```

---

## 📊 Feature Checklist

- [ ] Database schema created
- [ ] SSO authentication working (Azure AD)
- [ ] SSO authentication working (Google)
- [ ] User sessions persist
- [ ] Calendar events CRUD
- [ ] Calendar UI rendering
- [ ] Meeting booking system
- [ ] Room availability search
- [ ] Email notifications
- [ ] External calendar sync
- [ ] Notes linked to events/meetings
- [ ] Mobile responsive UI
- [ ] Error handling
- [ ] Security audit
- [ ] Performance testing
- [ ] Production deployment

---

## 🚀 Next Steps

1. **Phase 1**: Implement SSO authentication
2. **Phase 2**: Build calendar UI
3. **Phase 3**: Add meeting booking
4. **Phase 4**: Integrate external calendar sync
5. **Phase 5**: Add notifications
6. **Phase 6**: Polish and optimize

---

## 📚 Additional Resources

- [Azure AD OAuth Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Google Calendar API](https://developers.google.com/calendar)
- [FullCalendar Documentation](https://fullcalendar.io/docs)
- [Passport.js Documentation](http://www.passportjs.org/)

---

## ❓ Troubleshooting

### Issue: "Invalid redirect URI"
**Solution**: Make sure redirect URIs in Azure AD/Google match exactly (including http vs https)

### Issue: "Access token expired"
**Solution**: Implement token refresh logic in `auth-routes.js`

### Issue: "Room booking conflicts"
**Solution**: Check the availability query in `meeting-routes.js` for correct time overlap logic

### Issue: "Calendar sync not working"
**Solution**: Verify OAuth scopes include calendar permissions

---

## 📧 Support

For questions or issues, refer to the architecture document: `docs/CALENDAR_SSO_ARCHITECTURE.md`

