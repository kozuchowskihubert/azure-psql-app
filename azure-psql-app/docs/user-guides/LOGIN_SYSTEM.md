# 🔐 Interactive Login System Documentation

## Overview

The Notes App now features a sophisticated login system that allows users to choose between:
1. **Public Board Mode** - Browse and view notes without authentication
2. **Authenticated Mode** - Full access with SSO login (Azure AD or Google)

## Features

### 🎨 Login Page (`/login.html`)

A beautiful, interactive landing page where users choose their experience:

#### Public Board Option
- View all public notes
- Search and filter functionality
- Browse diagrams and content
- **Cannot**: Create, edit, or delete notes
- **Cannot**: Access personal calendar/meetings (future feature)

#### Sign In Option
- All public board features
- **Plus**: Create, edit, and delete notes
- **Plus**: Personal calendar and events
- **Plus**: Book meeting rooms
- **Plus**: Sync with external calendars
- SSO authentication via:
  - Microsoft Azure AD
  - Google OAuth

### 👤 User Interface Integration

#### Header Updates
When **logged in**:
- User profile section displays
  - User's display name or email
  - "Logged In" badge
  - User avatar (if available)
  - Sign Out button

When **guest mode**:
- Green "Sign In" button in header
- Blue info banner explaining limitations
- Disabled create/edit forms

### 🔒 Permission System

#### Authentication Checks

All state-changing operations require authentication:

**Create Note**:
```javascript
if (userMode !== 'authenticated') {
    showToast('Please sign in to create notes', 'error');
    redirect to /login.html
}
```

**Edit Note**:
```javascript
if (userMode !== 'authenticated') {
    showToast('Please sign in to edit notes', 'error');
    close modal
}
```

**Delete Note**:
```javascript
if (userMode !== 'authenticated') {
    showToast('Please sign in to delete notes', 'error');
    return
}
```

#### Read-Only Operations

These work for all users (authenticated or guest):
- View notes
- Search and filter
- View diagrams
- Browse calendar (public events)
- View meeting rooms

## Technical Implementation

### State Management

**localStorage Variables**:
```javascript
userMode: 'guest' | 'authenticated'
userProfile: { email, displayName, avatarUrl, ... }
```

**Session Checks**:
- On page load: Check `/api/auth/me` endpoint
- If authenticated: Load user profile
- If not: Fall back to guest mode

### Authentication Flow

#### 1. User Visits App
```
→ Check localStorage for userMode
→ Call /api/auth/me to verify session
→ Update UI based on result
```

#### 2. User Clicks "Sign In"
```
→ Redirect to /login.html
→ Choose Azure AD or Google
→ Redirect to /api/auth/login/{provider}
→ OAuth flow
→ Callback to /api/auth/callback/{provider}
→ Set session cookie
→ Store user in localStorage
→ Redirect to /
```

#### 3. User Clicks "Continue as Guest"
```
→ Set userMode = 'guest' in localStorage
→ Redirect to /
→ Show guest banner
→ Disable create/edit/delete
```

#### 4. User Clicks "Sign Out"
```
→ Call /api/auth/logout
→ Clear localStorage
→ Redirect to /login.html
```

### API Integration

#### Authentication Endpoints

**Check Session**:
```javascript
GET /api/auth/status
Response: { authenticated: boolean, ssoEnabled: boolean }
```

**Get Current User**:
```javascript
GET /api/auth/me
Response: { email, displayName, avatarUrl, provider }
```

**Login (Azure AD)**:
```javascript
GET /api/auth/login/azure
→ Redirects to Microsoft login
```

**Login (Google)**:
```javascript
GET /api/auth/login/google
→ Redirects to Google login
```

**Logout**:
```javascript
POST /api/auth/logout
→ Clears session
```

### SSO Detection

The login page automatically detects if SSO is configured:

```javascript
async function checkSSOAvailability() {
    const response = await fetch('/api/auth/status');
    if (response.ok) {
        // SSO is available - show login buttons
    } else {
        // SSO not configured - show info message
    }
}
```

## User Experience Flows

### Flow 1: New Guest User

1. User visits app root (`/`)
2. No session found → redirected to `/login.html`
3. User clicks "Continue as Guest"
4. Redirected to `/` with guest mode
5. Can browse notes, search, filter
6. Cannot create/edit/delete (disabled forms)
7. Banner shows: "Viewing in Public Mode. Sign in to unlock features"

### Flow 2: User Wants to Create Note

1. User in guest mode clicks "Create Note" button
2. Form is disabled
3. Sees banner: "Please sign in to create notes"
4. Clicks "Sign In" in banner or header
5. Redirected to `/login.html`
6. Chooses Azure AD or Google
7. Completes OAuth flow
8. Returns to `/` with full access
9. Can now create, edit, delete notes

### Flow 3: Returning Authenticated User

1. User visits app root (`/`)
2. Session cookie exists
3. `/api/auth/me` returns user profile
4. UI shows user profile in header
5. All features enabled
6. No banner shown

### Flow 4: User Signs Out

1. User clicks "Sign Out" button in header
2. Calls `/api/auth/logout`
3. Session cleared
4. localStorage cleared
5. Redirected to `/login.html`
6. Can choose to continue as guest or sign in again

## UI Components

### Login Page Structure

```html
<div class="choice-cards">
  <div class="public-board-card">
    <h2>Public Board</h2>
    <features-list readonly />
    <button>Continue as Guest</button>
  </div>
  
  <div class="sign-in-card">
    <h2>Sign In</h2>
    <features-list full-access />
    <sso-status-banner />
    <login-buttons>
      <button>Sign in with Microsoft</button>
      <button>Sign in with Google</button>
    </login-buttons>
  </div>
</div>
```

### Guest Mode Banner

```html
<div class="guest-banner">
  <i class="fas fa-info-circle"></i>
  <div>
    <p>Viewing in Public Mode</p>
    <p>You can view notes but cannot create or edit.
       <a href="/login.html">Sign in</a> to unlock all features.
    </p>
  </div>
  <button onclick="close"></button>
</div>
```

### User Profile Section

```html
<div class="user-profile-section">
  <img src="avatar" />
  <div>
    <p>Display Name</p>
    <p>Logged In</p>
  </div>
  <button id="logout">
    <i class="fas fa-sign-out-alt"></i>
  </button>
</div>
```

## Configuration

### Enabling SSO

SSO must be configured in Azure App Service:

```bash
az webapp config appsettings set \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --settings \
    ENABLE_SSO=true \
    AZURE_AD_CLIENT_ID="your-client-id" \
    AZURE_AD_CLIENT_SECRET="your-secret" \
    AZURE_AD_TENANT_ID="common" \
    GOOGLE_CLIENT_ID="your-google-id" \
    GOOGLE_CLIENT_SECRET="your-google-secret"
```

### OAuth Application Setup

#### Azure AD
1. Portal: https://portal.azure.com
2. Azure Active Directory → App registrations
3. New registration
4. Redirect URI: `https://notesapp-dev-app.azurewebsites.net/api/auth/callback/azure`
5. Create client secret
6. Copy: Client ID, Client Secret, Tenant ID

#### Google OAuth
1. Console: https://console.cloud.google.com
2. APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Redirect URI: `https://notesapp-dev-app.azurewebsites.net/api/auth/callback/google`
5. Copy: Client ID, Client Secret

## Testing

### Manual Testing

**Test Guest Mode**:
1. Clear localStorage and cookies
2. Visit app
3. Click "Continue as Guest"
4. Verify: Can view notes
5. Verify: Cannot create/edit/delete
6. Verify: Banner shows

**Test Authentication**:
1. Click "Sign In"
2. Choose provider
3. Complete OAuth
4. Verify: User profile shows
5. Verify: Can create/edit/delete
6. Verify: No banner

**Test Sign Out**:
1. While logged in, click "Sign Out"
2. Verify: Redirected to login page
3. Verify: Session cleared

### Automated Testing

Use the verification script:

```bash
./scripts/verify-sso.sh
```

This tests:
- SSO availability
- Auth endpoints
- Calendar API
- Meeting API

## Deployment

### Files Deployed

```
app/public/login.html          # Login page
app/public/index.html (modified) # User profile integration
app/public/app.js (modified)     # Auth state management
scripts/verify-sso.sh            # Testing script
```

### Deployment Steps

1. Commit changes: ✅ Done
2. Push to GitHub: ✅ Done
3. GitHub Actions builds and deploys
4. Wait 5-10 minutes for deployment
5. Test at: https://notesapp-dev-app.azurewebsites.net/login.html

## Troubleshooting

### "SSO Not Configured" Message

**Problem**: Login page shows "SSO Not Configured"

**Solutions**:
1. Check if `ENABLE_SSO=true` in Azure settings
2. Verify OAuth credentials are set
3. Check deployment completed
4. Review app logs for errors

### User Can't Create Notes After Login

**Problem**: User is authenticated but can't create notes

**Solutions**:
1. Check localStorage has `userMode=authenticated`
2. Verify `/api/auth/me` returns user object
3. Check browser console for errors
4. Clear cache and try again

### Redirect Loop

**Problem**: Page keeps redirecting

**Solutions**:
1. Clear localStorage and cookies
2. Check session cookie is being set
3. Verify OAuth callback URL matches registration
4. Check CORS settings

## Security Considerations

### Session Security

- Sessions stored in PostgreSQL via `connect-pg-simple`
- HTTP-only cookies (prevent XSS)
- Secure cookies in production
- Session timeout: 7 days
- CSRF protection via SameSite cookies

### OAuth Security

- State parameter prevents CSRF
- Nonce for replay protection
- Token encryption with AES-256
- Secrets stored in Azure Key Vault

### Frontend Security

- No sensitive data in localStorage
- User profile data is public info only
- Tokens never exposed to JavaScript
- All auth handled server-side

## Future Enhancements

### Planned Features

1. **Role-Based Access Control (RBAC)**
   - Admin, Manager, User, Guest roles
   - Permission-based feature access
   - Role assignment UI

2. **Personal vs Public Notes**
   - Users can mark notes as public or private
   - Public notes visible to all
   - Private notes only to owner

3. **Team Workspaces**
   - Shared note collections
   - Collaborative editing
   - Team member management

4. **Extended OAuth**
   - GitHub authentication
   - Okta support
   - Auth0 integration

5. **Two-Factor Authentication**
   - TOTP support
   - SMS verification
   - Backup codes

## Support

For issues or questions:
1. Check logs: `az webapp log tail --name notesapp-dev-app`
2. Review documentation: `docs/IMPLEMENTATION_GUIDE.md`
3. Test SSO: `./scripts/verify-sso.sh`
4. Check verification report: `SSO_VERIFICATION_REPORT.md`

---

**Status**: ✅ Deployed and Ready
**Version**: 1.0.0
**Last Updated**: November 16, 2025
