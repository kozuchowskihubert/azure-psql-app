# HAOS.fm Authentication & API Audit
**Date:** December 11, 2025  
**Status:** In Progress

## 🔍 System Audit Results

### API Endpoints Status

#### ✅ Working Endpoints
- `/api/tracks/list` - Returns track metadata from Azure Blob Storage
- `/api/tracks/upload` - Handles audio file uploads (fixed for serverless)

#### ⚠️ Database-Dependent Endpoints (FAILING)
- `/api/health` - Returns "unhealthy" - database disconnected
- `/api/auth/*` - Requires PostgreSQL connection
- `/api/presets` - May need database or filesystem
- `/api/features` - Feature flags system
- `/api/notes` - User notes system
- `/api/user/*` - User management
- `/api/platform/*` - Platform data

**Issue:** PostgreSQL not configured in Vercel environment variables

#### 🔐 Authentication Systems Found

1. **Local Email/Password** (`app/routes/registration-routes.js`)
   - Registration endpoint: `/api/auth/register`
   - Login endpoint: `/api/auth/login`
   - Requires: PostgreSQL database
   - Status: ❌ Not working (no DB connection)

2. **Google OAuth** (Passport.js)
   - Configuration found in `app/app.js`
   - Requires: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Status: ⚠️ Configured but needs verification

3. **Azure AD OAuth** (Passport.js)
   - Configuration found in `app/app.js`
   - Status: ⚠️ Optional feature

4. **Session Management**
   - Using `express-session` with PostgreSQL store
   - Status: ❌ Not working (no DB connection)

---

## 📋 What Needs to Be Done

### Priority 1: Database Setup (CRITICAL)

**Problem:** No PostgreSQL database configured in Vercel

**Solutions:**

#### Option A: Use Vercel Postgres (Recommended)
```bash
# Create Vercel Postgres database
vercel postgres create haos-fm-db

# Link to project
vercel link

# Get connection string
vercel env pull .env.production
```

#### Option B: Use External PostgreSQL (Neon, Supabase, Azure)
1. Create database on provider
2. Add connection string to Vercel env vars:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

#### Option C: Disable Auth (Quick Fix for Demo)
- Use client-side only auth (localStorage)
- No database required
- Limited features

**Tables Needed:**
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  azure_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_premium BOOLEAN DEFAULT FALSE
);

-- Sessions table (for express-session)
CREATE TABLE "session" (
  "sid" VARCHAR NOT NULL PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);

-- User preferences
CREATE TABLE user_preferences (
  user_id INTEGER REFERENCES users(id),
  theme VARCHAR(50),
  default_workspace VARCHAR(100),
  settings JSONB,
  PRIMARY KEY (user_id)
);

-- User projects (saved presets, tracks)
CREATE TABLE user_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  type VARCHAR(50),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Priority 2: Fix Google OAuth

**Current Issues:**
- Environment variables may not be set
- Callback URL may be incorrect
- Passport strategy may not be initialized

**Required Environment Variables:**
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://haos.fm/api/auth/google/callback
```

**Google Cloud Console Setup:**
1. Go to: https://console.cloud.google.com/
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://haos.fm/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (dev)

**Files to Check:**
- `app/app.js` (lines ~350-400) - Passport Google strategy
- `app/routes/registration-routes.js` - OAuth routes

---

### Priority 3: Create User Account Panel

**Required Pages:**

1. **Account Dashboard** (`/account`)
   - User profile information
   - Email, name, profile picture
   - Account creation date
   - Premium status
   - Quick stats (projects, uploads, etc.)

2. **Settings Page** (`/settings`)
   - Profile settings (name, email)
   - Password change (for local auth)
   - Theme preferences
   - Default workspace selection
   - Notification settings
   - Privacy settings

3. **My Projects** (`/my-projects`)
   - List of saved presets
   - Uploaded tracks
   - Saved patterns
   - Export/import functionality

4. **Subscription** (`/subscription`)
   - Current plan (Free/Premium)
   - Upgrade options
   - Billing history
   - Cancel subscription

**Navigation Integration:**
- Add "My Account" dropdown to main navigation
- User avatar in top-right corner
- Quick access to settings and logout

---

### Priority 4: Enhanced Registration & Login

**Registration Form Improvements:**

1. **Client-Side Validation**
   - Email format validation
   - Password strength meter
   - Confirm password match
   - Terms of service checkbox
   - Real-time feedback

2. **Server-Side Validation**
   - Check email uniqueness
   - Password requirements (min 8 chars, uppercase, number, special)
   - Rate limiting (prevent spam)
   - CAPTCHA integration (optional)

3. **Error Handling**
   - Clear error messages
   - Field-specific errors
   - Success notifications
   - Redirect after successful registration

4. **Social Login Buttons**
   - "Continue with Google" button
   - "Continue with Azure AD" button (optional)
   - Proper styling and icons

**Login Form Improvements:**

1. **Features**
   - "Remember me" checkbox
   - "Forgot password" link
   - Social login options
   - Auto-fill support

2. **Security**
   - Rate limiting (max 5 attempts per 15 min)
   - Account lockout after failed attempts
   - CSRF protection
   - Secure session management

3. **User Experience**
   - Loading states
   - Clear error messages
   - Success redirect
   - "Stay signed in" option

---

## 🎯 Implementation Plan

### Phase 1: Database Setup (Day 1)
- [ ] Create PostgreSQL database (Vercel Postgres or external)
- [ ] Add DATABASE_URL to Vercel environment variables
- [ ] Run database migrations
- [ ] Test database connectivity
- [ ] Verify session storage works

### Phase 2: Fix Authentication (Day 1-2)
- [ ] Test local registration endpoint
- [ ] Test local login endpoint
- [ ] Set up Google OAuth credentials
- [ ] Add Google env vars to Vercel
- [ ] Test Google login flow
- [ ] Implement proper error handling

### Phase 3: User Account Panel (Day 2-3)
- [ ] Create account dashboard page
- [ ] Create settings page
- [ ] Create my projects page
- [ ] Add navigation dropdown
- [ ] Implement profile editing
- [ ] Add logout functionality

### Phase 4: Enhanced Forms (Day 3)
- [ ] Add client-side validation to registration
- [ ] Add password strength indicator
- [ ] Improve error messaging
- [ ] Add social login buttons
- [ ] Style forms consistently
- [ ] Test all flows

### Phase 5: Testing & Polish (Day 4)
- [ ] Test all registration scenarios
- [ ] Test all login scenarios
- [ ] Test OAuth flows
- [ ] Test session persistence
- [ ] Test logout
- [ ] Security audit
- [ ] Performance optimization

---

## 🔧 Quick Start Commands

### Check Current Status
```bash
# Test API endpoints
curl https://haos.fm/api/health
curl https://haos.fm/api/tracks/list

# Check Vercel environment variables
cd /Users/haos/azure-psql-app
vercel env ls

# Check database connection
vercel postgres ls
```

### Setup Database (Vercel Postgres)
```bash
# Create database
vercel postgres create haos-fm-db

# Pull environment variables
vercel env pull

# Run migrations
npm run migrate
```

### Deploy Changes
```bash
git add .
git commit -m "Your message"
git push origin main
vercel --prod
```

---

## 📊 Current Environment Variables Status

### ✅ Configured
- `AZURE_STORAGE_CONNECTION_STRING` - Blob storage
- `AZURE_STORAGE_CONTAINER_NAME` - tracks container
- `VERCEL_OIDC_TOKEN` - Vercel authentication

### ❌ Missing (Critical)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key

### ⚠️ Missing (OAuth)
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GOOGLE_CALLBACK_URL` - Google OAuth redirect

### ⚠️ Missing (Optional)
- `AZURE_AD_CLIENT_ID` - Azure AD OAuth
- `AZURE_AD_CLIENT_SECRET` - Azure AD OAuth
- `STRIPE_SECRET_KEY` - Payment processing
- `PAYPAL_CLIENT_ID` - Payment processing

---

## 🚨 Security Considerations

1. **Password Hashing**: Using bcrypt (already implemented)
2. **Session Security**: Secure cookies, httpOnly, sameSite
3. **CSRF Protection**: Implement CSRF tokens
4. **Rate Limiting**: Already configured (100 req/15min)
5. **SQL Injection**: Using parameterized queries
6. **XSS Protection**: Helmet middleware configured
7. **HTTPS Only**: Enforced by Vercel

---

## 📝 Files to Review/Edit

### Authentication Files
- `app/routes/registration-routes.js` - Registration and login logic
- `app/app.js` (lines 350-400) - Passport configuration
- `app/config/database.js` - Database connection
- `app/middleware/auth.js` - Authentication middleware

### Frontend Files
- `app/public/register.html` - Registration form
- `app/public/login.html` - Login form
- Need to create: `account.html`, `settings.html`, `my-projects.html`

### Utilities
- `app/utils/validators.js` - Form validation
- `app/utils/db-init.js` - Database initialization

---

## ✅ Next Actions

1. **Immediate**: Set up PostgreSQL database
2. **High Priority**: Fix Google OAuth
3. **Medium Priority**: Create account panel
4. **Enhancement**: Improve registration forms

**Estimated Time**: 3-4 days for complete implementation

---

**Last Updated**: 2025-12-11
**Status**: Ready for implementation
