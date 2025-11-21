# Application Features Guide

## Overview

The Azure PostgreSQL Notes App is a modern, full-stack web application featuring a comprehensive user interface, advanced note management capabilities, and enterprise-grade cloud infrastructure.

---

## Frontend Features

### User Interface

#### Modern Design
- **Framework**: Single Page Application (SPA)
- **Styling**: Tailwind CSS with custom configurations
- **Icons**: Font Awesome 6.4.0
- **Responsive**: Mobile-first design approach
- **Browser Support**: All modern browsers

#### Visual Features
- Smooth animations and transitions
- Gradient headers and buttons
- Hover effects on interactive elements
- Adaptive layouts for all screen sizes
- Color-coded categories and status indicators

### Dark Mode

**Features**:
- Toggle between light and dark themes
- Theme preference saved in local storage
- Smooth color transitions
- Optimized for both day and night viewing

**Implementation**:
```javascript
// Toggle dark mode
const toggleTheme = () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark');
};
```

### Dashboard Statistics

Real-time statistics displayed in card format:

1. **Total Notes** (Blue)
   - Count of all notes in the system
   - Icon: Note sticky icon

2. **Important Notes** (Green)
   - Count of notes marked as important
   - Icon: Star icon

3. **Categories** (Purple)
   - Number of unique categories
   - Icon: Tags icon

4. **Recent Notes** (Orange)
   - Notes created in last 24 hours
   - Icon: Clock icon

### Search and Filtering

#### Search
- **Real-time search** as you type
- **Multi-field search**: Searches across title, content, and category
- **Case-insensitive**: Finds matches regardless of case
- **Instant results**: Updates immediately

**Example**:
```javascript
// Search implementation
const matchesSearch = !searchTerm || 
    note.title.toLowerCase().includes(searchTerm) || 
    note.content.toLowerCase().includes(searchTerm) ||
    (note.category && note.category.toLowerCase().includes(searchTerm));
```

#### Category Filter
- **Dropdown selection** from all available categories
- **Dynamic list**: Updates as new categories are added
- **All Categories**: Default option to show everything
- **Instant filtering**: Results update immediately

#### Sorting Options
1. **Newest First** (Default)
   - Sort by creation date, descending
   - Most recent notes appear first

2. **Oldest First**
   - Sort by creation date, ascending
   - Original notes appear first

3. **Title (A-Z)**
   - Alphabetical sort, ascending
   - Case-insensitive sorting

4. **Title (Z-A)**
   - Alphabetical sort, descending
   - Reverse alphabetical order

### Note Management

#### Create Note
**Form Fields**:
- **Title** (Required): Up to 255 characters
- **Content** (Required): Unlimited text
- **Category** (Optional): Up to 100 characters
- **Important** (Checkbox): Mark note as important

**Features**:
- Form validation
- Clear button to reset form
- Success notification on creation
- Auto-refresh of note list

#### View Notes
**Card Layout**:
- Responsive grid (1-3 columns based on screen size)
- Important banner for starred notes
- Category badge display
- Relative timestamps (e.g., "2h ago", "Just now")
- Hover effects with elevation
- Edit and delete action buttons

**Empty State**:
- Friendly message when no notes exist
- Visual icon representation
- Encouragement to create first note

#### Edit Note
**Modal Interface**:
- Overlay modal with backdrop
- Pre-populated form fields
- Same validation as create
- Save changes button
- Cancel option
- Close on backdrop click

#### Delete Note
**Confirmation**:
- JavaScript confirm dialog
- "Are you sure?" message
- Prevents accidental deletion
- Success notification on delete
- Immediate UI update

### Notifications (Toasts)

**Toast System**:
- **Position**: Top-right corner
- **Duration**: 5 seconds auto-dismiss
- **Dismissible**: Manual close button
- **Animations**: Slide in/out effects

**Types**:
1. **Success** (Green) - Note created/updated/deleted
2. **Error** (Red) - Failed operations
3. **Info** (Blue) - Refresh notifications
4. **Warning** (Yellow) - Cautionary messages

### Timestamps

**Relative Time Display**:
- **Just now**: < 1 minute
- **Xm ago**: < 1 hour (e.g., "15m ago")
- **Xh ago**: < 24 hours (e.g., "3h ago")
- **Xd ago**: < 7 days (e.g., "5d ago")
- **Full date**: > 7 days (e.g., "Nov 8, 2025, 2:30 PM")

**Tracked Timestamps**:
- `created_at`: When note was first created
- `updated_at`: When note was last modified
- Both displayed on note cards

---

## Backend Features

### API Endpoints

#### Health Check
```
GET /health
```
- Database connectivity verification
- Returns health status and timestamp
- Used by CI/CD health checks
- No authentication required

#### Notes CRUD
```
GET    /notes      - List all notes
GET    /notes/:id  - Get single note
POST   /notes      - Create new note
PUT    /notes/:id  - Update note
DELETE /notes/:id  - Delete note
```

### Database Features

#### Auto Schema Migration
```javascript
// Automatic column addition
ALTER TABLE notes ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE notes ADD COLUMN IF NOT EXISTS category VARCHAR(100);
// ... etc
```

**Benefits**:
- Seamless upgrades from old schema
- No manual migration needed
- Backward compatible
- Zero downtime migrations

#### Enhanced Schema
**Previous Schema** (Simple):
- `id`: Primary key
- `text`: Note content

**Current Schema** (Enhanced):
- `id`: Auto-incrementing ID
- `title`: Note title (255 chars)
- `content`: Full note content (unlimited)
- `category`: Optional categorization
- `important`: Boolean flag
- `created_at`: Creation timestamp
- `updated_at`: Modification timestamp

### Error Handling

**API Responses**:
```javascript
// Success
{ id: 1, title: "Note", content: "...", ... }

// Error
{ error: "title and content are required" }
```

**HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `204`: No Content (delete success)
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Server Error
- `503`: Service Unavailable (health check fail)

### Static File Serving

**Public Directory**:
```
app/public/
├── index.html  - Main SPA page
└── app.js      - Frontend JavaScript
```

**SPA Routing**:
- All non-API routes serve `index.html`
- Client-side routing support
- Deep linking enabled

---

## Performance Features

### Docker Optimizations
- **Multi-stage builds**: Smaller final image
- **Alpine base**: Minimal OS footprint
- **Layer caching**: Faster rebuilds
- **Build cache**: Registry-based caching

### Frontend Optimizations
- **CDN Resources**: Tailwind CSS and Font Awesome from CDN
- **Minimal JavaScript**: No heavy frameworks
- **Lazy Loading**: Images and resources as needed
- **Local Storage**: Theme preference cached locally

### Database Optimizations
- **Indexed Primary Key**: Fast lookups
- **Efficient Queries**: SELECT only needed columns
- **Connection Pooling**: pg Pool for connection reuse
- **Prepared Statements**: SQL injection prevention

---

## Security Features

### Input Validation
- **Required Fields**: Server-side validation
- **XSS Prevention**: HTML escaping in frontend
- **SQL Injection**: Parameterized queries
- **CSRF**: Stateless API design

### Authentication (Infrastructure)
- **Azure AD**: Service Principal authentication
- **PostgreSQL**: Username/password authentication
- **ACR**: Registry admin credentials
- **Private Network**: Database not publicly accessible

---

## Monitoring Features

### Health Endpoints
```javascript
// Database connection test
await client.query('SELECT 1');

// Response
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-08T13:25:36.201Z"
}
```

### Logging
- Console logging for all operations
- Error stack traces
- Request/response logging (optional)
- Azure App Service logs integration

---

## User Experience Features

### Loading States
- Spinner during data fetch
- "Loading notes..." message
- Smooth transition to content
- No flash of empty state

### Empty States
- Friendly messaging
- Visual icons
- Call-to-action text
- Encouragement to start

### Responsive Design

**Breakpoints**:
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

**Adaptive Features**:
- Touch-friendly buttons on mobile
- Optimized form layouts
- Readable font sizes
- Appropriate spacing

---

## Real-time Features

### Auto-refresh
- Manual refresh button in header
- Reloads all notes from database
- Updates statistics
- Toast notification on refresh

### Instant UI Updates
- Notes list updates after create/edit/delete
- Statistics recalculate automatically
- No page reload required
- Optimistic UI updates

---

## Customization Features

### Theme Variables
```javascript
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#667eea',
                secondary: '#764ba2'
            }
        }
    }
}
```

### Styling Hooks
- CSS classes for all components
- Consistent color scheme
- Modular CSS structure
- Easy brand customization

---

## Progressive Web App Ready

**Current Features**:
- Responsive design
- Offline-capable (with service worker)
- Mobile-optimized UI
- Touch gestures support

**Future Enhancements**:
- Service worker for offline mode
- Web app manifest
- Install to home screen
- Push notifications

---

## Accessibility Features

**Current**:
- Semantic HTML structure
- ARIA labels on buttons
- Keyboard navigation
- High contrast dark mode

**Planned**:
- Screen reader optimization
- Focus indicators
- Skip navigation links
- WCAG 2.1 AA compliance

---

## Future Features Roadmap

### Short-term
- Rich text editor
- File attachments
- Note sharing
- Export to PDF/Markdown

### Mid-term
- User authentication
- Multi-user support
- Real-time collaboration
- Note versioning

### Long-term
- Mobile apps (iOS/Android)
- API rate limiting
- Advanced search with filters
- AI-powered note summarization

---

## Resources

- **Live Demo**: [https://notesapp-dev-app.azurewebsites.net](https://notesapp-dev-app.azurewebsites.net)
- **Repository**: [https://github.com/kozuchowskihubert/azure-psql-app](https://github.com/kozuchowskihubert/azure-psql-app)
- **Architecture**: [Technical Architecture](../technical/ARCHITECTURE.md)
- **Deployment**: [Deployment Guide](../technical/DEPLOYMENT.md)
- **Product Roadmap**: [Business Roadmap](../business/ROADMAP.md)
