# 🚀 How to Enable Optional Features

This guide shows you how to enable the three optional features that are currently disabled.

---

## 📋 Currently Disabled Features

1. **📅 Calendar Sync** - Sync events with external calendars
2. **🤝 Meeting Rooms** - Book and manage meeting rooms  
3. **🔐 Single Sign-On** - Azure AD and Google OAuth authentication

---

## ⚡ Quick Enable (Local Development)

### 1. Set Environment Variables

Create or edit `.env` file in `/app` directory:

```bash
cd /Users/haos/Projects/azure-psql-app/app

cat > .env << 'EOF'
# Optional Features
ENABLE_CALENDAR_SYNC=true
ENABLE_MEETING_ROOMS=true
ENABLE_SSO=true

# Session Secret (generate with: openssl rand -hex 32)
SESSION_SECRET=your_32_character_hex_string_here

# Database (if not already set)
DATABASE_URL=postgresql://user:pass@localhost:5432/notesapp

# SSO Configuration (if enabling SSO)
AZURE_AD_CLIENT_ID=your_azure_client_id
AZURE_AD_CLIENT_SECRET=your_azure_client_secret
AZURE_AD_TENANT_ID=your_azure_tenant_id

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application URLs
APP_URL=http://localhost:3000
EOF
```

### 2. Deploy Database Schema

The Calendar and Meeting features require database tables:

```bash
cd /Users/haos/Projects/azure-psql-app/infra

# Deploy the schema
./deploy-schema.sh
```

This creates tables for:
- `calendar_events`
- `meeting_rooms`
- `meeting_bookings`
- `meeting_participants`
- `users` (for SSO)
- `sessions` (for authentication)

### 3. Restart Server

```bash
cd /Users/haos/Projects/azure-psql-app/app
npm start
```

### 4. Verify Features

```bash
# Check feature status
curl http://localhost:3000/api/features | jq '.enabled, .disabled'

# Should show all features enabled
```

---

## 🌐 Enable in Production (Azure)

### Option 1: Using Azure CLI

```bash
# Set environment variables
az webapp config appsettings set \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --settings \
    ENABLE_CALENDAR_SYNC=true \
    ENABLE_MEETING_ROOMS=true \
    ENABLE_SSO=true \
    SESSION_SECRET=$(openssl rand -hex 32)

# Deploy database schema
cd infra
./deploy-schema.sh

# Restart app
az webapp restart \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg
```

### Option 2: Using Existing Script

```bash
cd /Users/haos/Projects/azure-psql-app/infra

# This script does everything
./enable-features.sh
```

---

## 🔐 SSO Configuration

### Azure AD Setup

1. **Register App in Azure Portal**
   - Go to https://portal.azure.com
   - Navigate to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Name: "Notes App"
   - Redirect URI: `http://localhost:3000/api/auth/azure/callback` (dev)
                    `https://notesapp-dev-app.azurewebsites.net/api/auth/azure/callback` (prod)

2. **Get Credentials**
   - Copy "Application (client) ID" → `AZURE_AD_CLIENT_ID`
   - Copy "Directory (tenant) ID" → `AZURE_AD_TENANT_ID`
   - Go to "Certificates & secrets" → "New client secret"
   - Copy value → `AZURE_AD_CLIENT_SECRET`

3. **Set Permissions**
   - Go to "API permissions"
   - Add: `User.Read`, `email`, `openid`, `profile`

### Google OAuth Setup

1. **Create Project in Google Cloud Console**
   - Go to https://console.cloud.google.com
   - Create new project: "Notes App"

2. **Enable OAuth**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (dev)
     - `https://notesapp-dev-app.azurewebsites.net/api/auth/google/callback` (prod)

3. **Get Credentials**
   - Copy "Client ID" → `GOOGLE_CLIENT_ID`
   - Copy "Client secret" → `GOOGLE_CLIENT_SECRET`

---

## 📅 Calendar Integration

### Enable External Calendar Sync

After enabling the feature, you can integrate with:

- **Google Calendar API**
- **Microsoft Graph API (Outlook)**
- **Apple Calendar (CalDAV)**

### Implementation Steps

1. **Get API Credentials**
   - Google: https://console.cloud.google.com
   - Microsoft: https://portal.azure.com

2. **Update Configuration**
   ```bash
   # Add to .env
   GOOGLE_CALENDAR_API_KEY=your_api_key
   GOOGLE_CALENDAR_CLIENT_ID=your_client_id
   
   # OR for Microsoft
   MICROSOFT_GRAPH_CLIENT_ID=your_client_id
   MICROSOFT_GRAPH_CLIENT_SECRET=your_secret
   ```

3. **Implement Sync Logic**
   - Edit: `app/routes/calendar-routes.js`
   - Find: `// TODO: Implement actual sync logic`
   - Add OAuth flow and API calls

---

## 🤝 Meeting Rooms Configuration

### Add Meeting Rooms

Once enabled, seed the database with rooms:

```sql
INSERT INTO meeting_rooms (name, location, capacity, features, is_active)
VALUES 
  ('Conference Room A', 'Building 1, Floor 2', 10, '{"projector": true, "whiteboard": true}', true),
  ('Board Room', 'Building 1, Floor 3', 20, '{"projector": true, "video_conf": true}', true),
  ('Small Meeting Room', 'Building 2, Floor 1', 4, '{"whiteboard": true}', true);
```

### Configure Email Notifications

```bash
# Add to .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Or use SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
```

---

## ✅ Verification Checklist

After enabling features, verify:

### Calendar
- [ ] `/calendar.html` loads without errors
- [ ] Can create calendar events
- [ ] Events are saved to database
- [ ] Events appear in calendar view
- [ ] Can edit and delete events

### Meetings
- [ ] `/meetings.html` loads without errors
- [ ] Can see list of meeting rooms
- [ ] Can filter rooms by capacity/features
- [ ] Can book a meeting
- [ ] Room availability is checked
- [ ] Meeting appears in calendar

### SSO
- [ ] `/login.html` shows Azure AD and Google buttons
- [ ] Can login with Azure AD
- [ ] Can login with Google
- [ ] Session persists across pages
- [ ] Can logout successfully
- [ ] User info appears in profile section

---

## 🔍 Troubleshooting

### Features Not Appearing

```bash
# Check environment variables
node -e "console.log(process.env.ENABLE_CALENDAR_SYNC)"
node -e "console.log(process.env.ENABLE_MEETING_ROOMS)"
node -e "console.log(process.env.ENABLE_SSO)"

# Should print: true
```

### Database Errors

```bash
# Check if tables exist
psql $DATABASE_URL -c "\dt"

# Should show: calendar_events, meeting_rooms, meeting_bookings, etc.
```

### SSO Not Working

```bash
# Check SSO status
curl http://localhost:3000/api/auth/status

# Should return: {"authenticated": false, "ssoEnabled": true}
```

### Server Logs

```bash
# Check server output
cd /Users/haos/Projects/azure-psql-app/app
npm start

# Look for:
# ✓ Calendar API enabled
# ✓ Meeting API enabled
# ✓ SSO authentication enabled
```

---

## 📚 Additional Resources

- [Database Schema](../infra/schema-extensions.sql)
- [Enable Features Script](../infra/enable-features.sh)
- [Calendar Routes](../app/routes/calendar-routes.js)
- [Meeting Routes](../app/routes/meeting-routes.js)
- [Auth Configuration](../app/auth/sso-config.js)
- [Architecture Guide](./technical/CALENDAR_SSO_ARCHITECTURE.md)

---

## 🆘 Need Help?

If you encounter issues:

1. Check server logs for errors
2. Verify environment variables are set
3. Ensure database schema is deployed
4. Check OAuth credentials are correct
5. Verify redirect URIs match exactly

---

**Last Updated**: November 22, 2025  
**Status**: Ready for Use
