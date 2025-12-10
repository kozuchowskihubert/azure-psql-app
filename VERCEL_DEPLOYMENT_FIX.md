# 🚀 HAOS.fm Vercel Deployment Fix

## Problem: 503 Service Unavailable

The live website (haos.fm) is returning 503 errors because:
1. Vercel configuration needs to be in the root directory
2. Server routing needs proper configuration
3. Environment variables need to be set in Vercel dashboard

## ✅ Solution Implemented

### 1. Fixed `vercel.json` Configuration

**Location:** `/vercel.json` (moved from `deployment/vercel/`)

**Key Changes:**
- ✅ Proper routes for `/api/*` and `/auth/*` → server.js
- ✅ Static file serving for HTML/CSS/JS
- ✅ Lambda function configuration (1024MB memory, 10s timeout)
- ✅ Security headers (XSS, CSRF, Frame protection)
- ✅ CORS headers for API routes
- ✅ Caching for static assets
- ✅ Rewrites for SPA routes (haos-platform, presets)
- ✅ Redirects for clean URLs

### 2. Deploy to Vercel

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd /Users/haos/azure-psql-app
vercel --prod
```

### 3. Set Environment Variables in Vercel Dashboard

Go to: https://vercel.com/your-project/settings/environment-variables

**Required Variables:**

```bash
# Application
APP_URL=https://haos.fm
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Session
SESSION_SECRET=your-secure-random-string-here

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_FROM=noreply@haos.fm

# Optional OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

### 4. Vercel Project Settings

**Framework Preset:** Other
**Build Command:** (leave empty - static + serverless)
**Output Directory:** app/public
**Install Command:** npm install
**Development Command:** npm run dev

### 5. Domain Configuration

In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add domain: `haos.fm`
3. Add domain: `www.haos.fm` (redirect to haos.fm)
4. Configure DNS (if not already done):
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

## 📋 Deployment Checklist

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Set environment variables in dashboard
- [ ] Deploy: `vercel --prod`
- [ ] Verify deployment: `https://haos.fm`
- [ ] Test login/register flows
- [ ] Test API endpoints
- [ ] Verify static assets load

## 🔍 Troubleshooting

### If 503 persists:

1. **Check Vercel Logs:**
   ```bash
   vercel logs https://haos.fm
   ```

2. **Check Function Timeout:**
   - Functions timeout after 10s (Hobby plan)
   - Check if database queries are slow
   - Consider upgrading to Pro plan (60s timeout)

3. **Check Database Connection:**
   - Ensure DATABASE_URL is set correctly
   - Test connection from local environment
   - Check PostgreSQL server is accessible

4. **Check Build Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click latest deployment
   - Check build and function logs

### Common Issues:

**"Module not found"**
- Ensure `package.json` is in root or app directory
- Run `npm install` locally to verify dependencies

**"DATABASE_URL not found"**
- Add environment variable in Vercel dashboard
- Redeploy after adding variables

**"Session secret required"**
- Add SESSION_SECRET environment variable
- Generate with: `openssl rand -base64 32`

**CORS errors**
- Check APP_URL matches deployment URL
- Verify CORS headers in vercel.json

## 🎯 Quick Deploy Commands

```bash
# One-time setup
npm install -g vercel
vercel login

# Every deployment
cd /Users/haos/azure-psql-app
git add .
git commit -m "Deploy to production"
git push origin main
vercel --prod

# Or let Vercel auto-deploy from GitHub
# (recommended after initial setup)
```

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Deployment Docs: https://vercel.com/docs
- Node.js on Vercel: https://vercel.com/docs/runtimes#official-runtimes/node-js
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

## ✅ Expected Result

After deployment:
- ✅ https://haos.fm → Homepage loads
- ✅ https://haos.fm/login.html → Login page
- ✅ https://haos.fm/api/health → API responds
- ✅ https://haos.fm/auth/status → Auth status
- ✅ No 503 errors
- ✅ Fast load times (<2s)

## 🎉 Success Criteria

1. Homepage loads without errors
2. Login/Register forms work
3. API endpoints respond correctly
4. OAuth flows complete successfully
5. Static assets load with caching
6. No console errors in browser
