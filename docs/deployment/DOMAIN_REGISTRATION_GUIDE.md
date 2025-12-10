# Domain Registration Guide: haos.fm
**Date**: November 23, 2025  
**Domain**: haos.fm  
**Status**: 📋 PLANNING PHASE

---

## 🌍 Overview

This guide walks you through registering the `haos.fm` domain and deploying your music production platform worldwide.

---

## 📋 Domain Registration Process

### Step 1: Choose a Domain Registrar

**Recommended Registrars for .fm domains**:

| Registrar | Price/Year | Features | DNS Management |
|-----------|------------|----------|----------------|
| **Namecheap** | ~$89-109 | Free WhoisGuard, DNS | ✅ Excellent |
| **GoDaddy** | ~$79-99 | Basic privacy | ✅ Good |
| **Google Domains** | ~$88 | Clean interface | ✅ Excellent |
| **Cloudflare** | ~$88 | Free CDN, SSL | ✅ Excellent |
| **Hover** | ~$99 | Simple, no upsells | ✅ Good |

**Recommendation**: **Cloudflare** or **Namecheap**
- Cloudflare: Best for CDN and DDoS protection (perfect for music streaming)
- Namecheap: Best value with free privacy protection

---

### Step 2: Register haos.fm

#### Option A: Namecheap Registration

1. **Visit**: https://www.namecheap.com
2. **Search**: Enter "haos.fm" in search box
3. **Add to Cart**: If available, add to cart
4. **Enable WhoisGuard**: Free privacy protection
5. **Checkout**: Create account and complete payment
6. **Price**: ~$89-109/year

#### Option B: Cloudflare Registration

1. **Visit**: https://www.cloudflare.com/products/registrar/
2. **Create Account**: Sign up for Cloudflare
3. **Register Domain**: Search for "haos.fm"
4. **Enable Features**:
   - Free SSL certificates
   - Free DDoS protection
   - Free CDN
   - No markup pricing
5. **Price**: At-cost (~$88/year)

---

### Step 3: Domain Verification

**After Registration**:
1. ✅ Check email for confirmation
2. ✅ Verify domain ownership (click link in email)
3. ✅ Wait for domain propagation (can take 24-48 hours)

**Check Domain Status**:
```bash
# Check if domain is registered
whois haos.fm

# Check DNS propagation
nslookup haos.fm

# Check from multiple locations
https://www.whatsmydns.net/#A/haos.fm
```

---

## 🚀 Deployment Options

### Option 1: Azure App Service (Recommended for your stack)

**Why Azure**:
- ✅ You already have Azure infrastructure (backend.tf)
- ✅ PostgreSQL integration ready
- ✅ Scalable and reliable
- ✅ Global CDN available
- ✅ Free SSL certificates

#### Azure Deployment Steps:

**1. Create App Service**:
```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create --name haos-fm-prod --location eastus

# Create App Service Plan
az appservice plan create \
  --name haos-fm-plan \
  --resource-group haos-fm-prod \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name haos-fm \
  --resource-group haos-fm-prod \
  --plan haos-fm-plan \
  --runtime "NODE|18-lts"
```

**2. Configure Environment**:
```bash
# Set Node.js version
az webapp config appsettings set \
  --resource-group haos-fm-prod \
  --name haos-fm \
  --settings WEBSITE_NODE_DEFAULT_VERSION="~18"

# Set database connection
az webapp config appsettings set \
  --resource-group haos-fm-prod \
  --name haos-fm \
  --settings \
    DATABASE_HOST="your-postgres-server.postgres.database.azure.com" \
    DATABASE_PORT="5432" \
    DATABASE_NAME="musicapp" \
    DATABASE_USER="your-user" \
    DATABASE_PASSWORD="your-password" \
    NODE_ENV="production"
```

**3. Deploy Application**:
```bash
# Build and deploy
cd /Users/haos/Projects/azure-psql-app
npm run build

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group haos-fm-prod \
  --name haos-fm \
  --src ./deploy.zip
```

**4. Configure Custom Domain**:
```bash
# Add custom domain
az webapp config hostname add \
  --resource-group haos-fm-prod \
  --webapp-name haos-fm \
  --hostname haos.fm

# Enable HTTPS
az webapp config ssl bind \
  --resource-group haos-fm-prod \
  --name haos-fm \
  --certificate-thumbprint auto \
  --ssl-type SNI
```

---

### Option 2: Vercel (Easiest for Node.js)

**Why Vercel**:
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Free tier available

#### Vercel Deployment:

**1. Install Vercel CLI**:
```bash
npm install -g vercel
```

**2. Deploy**:
```bash
cd /Users/haos/Projects/azure-psql-app/app
vercel login
vercel --prod
```

**3. Add Custom Domain**:
```bash
vercel domains add haos.fm
```

**4. Configure DNS** (in your registrar):
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

---

### Option 3: DigitalOcean App Platform

**Why DigitalOcean**:
- ✅ Simple pricing ($5-12/month)
- ✅ Managed PostgreSQL
- ✅ Automatic deployments
- ✅ Built-in SSL

#### DigitalOcean Deployment:

**1. Create Account**: https://www.digitalocean.com

**2. Create App**:
- Click "Create" → "Apps"
- Connect GitHub repository
- Select `azure-psql-app` repo
- Choose branch: `feat/tracks`

**3. Configure**:
```yaml
name: haos-fm
services:
  - name: web
    github:
      repo: kozuchowskihubert/azure-psql-app
      branch: feat/tracks
    build_command: npm install && npm run build
    run_command: npm start
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_HOST
        value: ${db.HOSTNAME}
      - key: DATABASE_PORT
        value: ${db.PORT}
    http_port: 3000

databases:
  - name: postgres-db
    engine: PG
    version: "14"
```

**4. Add Domain**:
- Go to Settings → Domains
- Add `haos.fm`
- Update DNS at registrar

---

## 🔧 DNS Configuration

### Cloudflare DNS Setup (Recommended)

**A Records**:
```
Type: A
Name: @
Value: [Your server IP]
Proxy: Enabled (orange cloud)
TTL: Auto
```

**WWW Subdomain**:
```
Type: CNAME
Name: www
Value: haos.fm
Proxy: Enabled
TTL: Auto
```

**Additional Records**:
```
# API subdomain (optional)
Type: CNAME
Name: api
Value: haos.fm
Proxy: Enabled

# Radio subdomain (optional)
Type: CNAME
Name: radio
Value: haos.fm
Proxy: Enabled
```

---

### Namecheap DNS Setup

**If using external hosting**:

1. Go to Domain List → Manage → Advanced DNS
2. Add records:

```
Type: A Record
Host: @
Value: [Your server IP]
TTL: Automatic

Type: CNAME Record
Host: www
Value: haos.fm
TTL: Automatic
```

**If using Cloudflare**:
1. Change nameservers to Cloudflare's:
   - `ahmed.ns.cloudflare.com`
   - `nina.ns.cloudflare.com`

---

## 🔒 SSL/HTTPS Configuration

### Free SSL Options:

**1. Let's Encrypt** (Most common):
```bash
# Using Certbot
sudo certbot --nginx -d haos.fm -d www.haos.fm
```

**2. Cloudflare SSL** (Automatic):
- Enable "Full (strict)" SSL mode in Cloudflare dashboard
- Certificate auto-generated and renewed

**3. Azure Managed Certificate** (Free):
- Automatically provided when using Azure App Service
- Auto-renewal included

---

## 📦 Pre-Deployment Checklist

### Code Preparation:

- [x] ✅ Dark mode implemented
- [x] ✅ Advanced mode toggle added
- [x] ✅ All features verified
- [ ] 🔄 Environment variables configured
- [ ] 🔄 Database migrations ready
- [ ] 🔄 Production build tested
- [ ] 🔄 Error handling added
- [ ] 🔄 Logging configured
- [ ] 🔄 Performance optimized

### Security:

- [ ] 🔄 HTTPS enforced
- [ ] 🔄 CORS configured
- [ ] 🔄 Rate limiting added
- [ ] 🔄 Input validation enabled
- [ ] 🔄 SQL injection protection
- [ ] 🔄 XSS protection
- [ ] 🔄 CSRF tokens implemented
- [ ] 🔄 Secrets in environment variables

### Performance:

- [ ] 🔄 Asset minification
- [ ] 🔄 Gzip compression
- [ ] 🔄 CDN for static files
- [ ] 🔄 Database indexing
- [ ] 🔄 Caching strategy
- [ ] 🔄 Image optimization

---

## 🛠️ Required Configuration Files

### 1. Create Production Environment File

```bash
# Create .env.production
cat > /Users/haos/Projects/azure-psql-app/.env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-postgres-server.database.azure.com
DATABASE_PORT=5432
DATABASE_NAME=musicapp
DATABASE_USER=your-user
DATABASE_PASSWORD=your-password
SESSION_SECRET=your-super-secret-key-here
DOMAIN=haos.fm
ENABLE_SSL=true
EOF
```

### 2. Create vercel.json (if using Vercel)

```json
{
  "version": 2,
  "name": "haos-fm",
  "builds": [
    {
      "src": "app/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "app/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "app/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "app/public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "DATABASE_HOST": "@database-host",
    "DATABASE_PORT": "@database-port",
    "DATABASE_NAME": "@database-name",
    "DATABASE_USER": "@database-user",
    "DATABASE_PASSWORD": "@database-password"
  }
}
```

### 3. Create Dockerfile (if using containers)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY app/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY app/ ./

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### 4. Update package.json scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'",
    "test": "jest",
    "deploy:azure": "az webapp deployment source config-zip ...",
    "deploy:vercel": "vercel --prod"
  }
}
```

---

## 📊 Cost Estimation

### Monthly Costs:

| Service | Provider | Cost/Month | Features |
|---------|----------|------------|----------|
| **Domain** | Cloudflare | ~$7-9 | haos.fm registration |
| **Hosting** | Azure App Service B1 | ~$13 | 1.75GB RAM, 100GB storage |
| **Database** | Azure PostgreSQL | ~$40 | Basic tier |
| **CDN** | Cloudflare | Free | Unlimited bandwidth |
| **SSL** | Let's Encrypt | Free | Auto-renewal |
| **Total** | | **~$60-62/month** | |

### Alternative (Budget Option):

| Service | Provider | Cost/Month |
|---------|----------|------------|
| **Domain** | Namecheap | ~$7-9 |
| **Hosting** | Vercel | Free (Hobby) |
| **Database** | Supabase | Free (500MB) |
| **Total** | | **~$7-9/month** |

---

## 🚀 Quick Start Guide

### Fastest Path to Production (1 hour):

**1. Register Domain (15 min)**:
```bash
# Go to Cloudflare Registrar
# Search "haos.fm"
# Complete payment
```

**2. Deploy to Vercel (10 min)**:
```bash
npm install -g vercel
cd /Users/haos/Projects/azure-psql-app/app
vercel login
vercel --prod
```

**3. Add Domain to Vercel (5 min)**:
```bash
vercel domains add haos.fm
```

**4. Configure DNS (30 min)**:
- Add CNAME record: `@ → cname.vercel-dns.com`
- Wait for propagation

**5. Test**:
```bash
curl https://haos.fm
```

---

## 🧪 Testing Before Going Live

### Local Testing:

```bash
# Test production build locally
cd /Users/haos/Projects/azure-psql-app/app
NODE_ENV=production npm start

# Test with production database
export DATABASE_HOST=your-prod-db.azure.com
npm start

# Open in browser
open http://localhost:3000
```

### Staging Environment:

1. Deploy to staging first:
   - Use subdomain: `staging.haos.fm`
   - Test all features
   - Monitor for 24-48 hours

2. Check functionality:
   - [ ] Landing page loads
   - [ ] Dark mode works
   - [ ] Trap Studio functions
   - [ ] Techno Creator works
   - [ ] Radio 24/7 plays
   - [ ] Synth 2600 loads
   - [ ] Database connections
   - [ ] File uploads work

---

## 📱 Mobile & Global Testing

### Test from Multiple Locations:

**Tools**:
- https://www.webpagetest.org - Performance testing
- https://tools.pingdom.com - Speed test
- https://www.gtmetrix.com - Performance analysis
- https://observatory.mozilla.org - Security check

**Mobile Testing**:
- iOS Safari
- Android Chrome
- Tablet devices
- Different screen sizes

---

## 🔍 Post-Deployment Monitoring

### Setup Monitoring:

**1. Uptime Monitoring**:
- UptimeRobot (free): https://uptimerobot.com
- Pingdom
- StatusCake

**2. Analytics**:
```html
<!-- Add to index.html -->
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<!-- Cloudflare Analytics (privacy-friendly) -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'></script>
```

**3. Error Tracking**:
- Sentry: https://sentry.io
- LogRocket: https://logrocket.com

---

## 📋 Domain Checklist

### Before Registration:
- [ ] Confirm `haos.fm` is available
- [ ] Choose registrar (Cloudflare/Namecheap)
- [ ] Prepare payment method
- [ ] Create account with registrar

### During Registration:
- [ ] Register domain for 1+ years
- [ ] Enable privacy protection
- [ ] Set up DNS management
- [ ] Enable auto-renewal

### After Registration:
- [ ] Verify domain ownership
- [ ] Configure DNS records
- [ ] Set up SSL certificate
- [ ] Test domain propagation
- [ ] Deploy application
- [ ] Test worldwide access

---

## 🌐 Making It Available Worldwide

### CDN Configuration:

**Cloudflare CDN** (Recommended):
1. Add site to Cloudflare
2. Update nameservers
3. Enable "Auto Minify" (HTML, CSS, JS)
4. Enable "Brotli" compression
5. Set caching rules:
   ```
   Cache Level: Standard
   Browser Cache TTL: 4 hours
   Edge Cache TTL: 2 hours
   ```

### Geographic Distribution:

**Azure CDN**:
```bash
# Create CDN profile
az cdn profile create \
  --resource-group haos-fm-prod \
  --name haos-fm-cdn \
  --sku Standard_Microsoft

# Create endpoint
az cdn endpoint create \
  --resource-group haos-fm-prod \
  --profile-name haos-fm-cdn \
  --name haos-fm \
  --origin haos-fm.azurewebsites.net
```

---

## 🎯 Next Steps

### Immediate Actions:

1. **Register Domain**:
   - [ ] Choose registrar
   - [ ] Complete registration
   - [ ] Verify ownership

2. **Choose Hosting**:
   - [ ] Evaluate options (Azure/Vercel/DO)
   - [ ] Create account
   - [ ] Set up billing

3. **Deploy Application**:
   - [ ] Configure environment variables
   - [ ] Run database migrations
   - [ ] Deploy to production
   - [ ] Test thoroughly

4. **Configure DNS**:
   - [ ] Add A/CNAME records
   - [ ] Enable SSL
   - [ ] Wait for propagation

5. **Go Live**:
   - [ ] Test from multiple locations
   - [ ] Monitor for issues
   - [ ] Announce launch! 🎉

---

## 📞 Support Resources

### Domain Registration Help:
- Cloudflare Support: https://support.cloudflare.com
- Namecheap Support: https://www.namecheap.com/support/

### Deployment Help:
- Azure Docs: https://docs.microsoft.com/azure
- Vercel Docs: https://vercel.com/docs
- DigitalOcean Tutorials: https://www.digitalocean.com/community/tutorials

---

## 💡 Pro Tips

1. **Start with Vercel**: Easiest deployment, free tier
2. **Use Cloudflare**: Best DNS + CDN + Security
3. **Enable Auto-Renewal**: Never lose your domain
4. **Set up monitoring**: Know when site is down
5. **Use staging**: Test before production deployment
6. **Backup database**: Regular automated backups
7. **Keep documentation**: Track all configuration changes

---

## ✅ Summary

**To make haos.fm available worldwide**:

1. ✅ Register domain at Cloudflare or Namecheap (~$89/year)
2. ✅ Deploy app to Vercel/Azure/DigitalOcean
3. ✅ Configure DNS to point to your hosting
4. ✅ Enable SSL/HTTPS (automatic with most hosts)
5. ✅ Test from multiple locations
6. ✅ Set up monitoring and analytics
7. ✅ Announce your music platform to the world! 🎵

**Estimated Time**: 2-4 hours  
**Estimated Cost**: $7-62/month (depending on hosting choice)

---

*Ready to launch haos.fm and bring your music production platform to the world!* 🚀🎵

**Document Version**: 1.0  
**Last Updated**: November 23, 2025  
**Status**: Ready for Implementation
