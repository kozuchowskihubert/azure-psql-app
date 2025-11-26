# 🌐 OVH Domain Configuration for HAOS.fm

Complete step-by-step guide to configure your OVH domain with your HAOS.fm application.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option A: Deploy to Azure (Recommended)](#option-a-deploy-to-azure-recommended)
3. [Option B: Deploy to Vercel](#option-b-deploy-to-vercel)
4. [Option C: Deploy to OVH Hosting](#option-c-deploy-to-ovh-hosting)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Verification & Testing](#verification--testing)

---

## 🎯 Prerequisites

### What You Need:

- ✅ OVH account with domain purchased
- ✅ GitHub repository: `kozuchowskihubert/azure-psql-app`
- ✅ Current deployments:
  - Main app: `notesapp-dev-app.azurewebsites.net`
  - Music app: `notesapp-dev-music-app.azurewebsites.net`

### Your Domain Info:

- **OVH Manager:** https://www.ovh.com/manager/#/hub
- **Domain Name:** (example: `haos.fm` or `yourname.com`)

---

## 🚀 Option A: Deploy to Azure (Recommended)

### Why Azure?
- ✅ Already deployed and running
- ✅ Database integration ready
- ✅ Better performance for full-stack app
- ✅ WebSocket support (for collaboration features)
- ✅ Custom domain with SSL included

### Step 1: Configure Custom Domain in Azure

#### 1.1 Login to Azure Portal

```bash
# Open Azure Portal
open https://portal.azure.com
```

Or via CLI:
```bash
az login
```

#### 1.2 Add Custom Domain to Web App

**Via Azure Portal:**

1. Navigate to your Web App:
   - Go to: **App Services** → **notesapp-dev-app**
   
2. Add Custom Domain:
   - Left menu → **Custom domains**
   - Click **+ Add custom domain**
   - Enter your domain: `haos.fm` (or `www.haos.fm`)
   - Click **Validate**

3. Note the verification details:
   - **CNAME Record:** Copy the value (looks like `notesapp-dev-app.azurewebsites.net`)
   - **TXT Record:** Copy the verification code

**Via Azure CLI:**

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --hostname haos.fm

# Add www subdomain
az webapp config hostname add \
  --webapp-name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --hostname www.haos.fm
```

### Step 2: Configure DNS in OVH Manager

#### 2.1 Login to OVH

1. Go to: https://www.ovh.com/manager/#/hub
2. Navigate to: **Web Cloud** → **Domain names** → Select your domain
3. Click on **DNS Zone** tab

#### 2.2 Add DNS Records

Click **Add an entry** and add these records:

**For Root Domain (haos.fm):**

```
Type: A
Subdomain: (leave empty or @)
Target: <Azure IP - get from portal>
TTL: 3600

Type: TXT
Subdomain: asuid
Target: <Verification code from Azure>
TTL: 3600
```

**For WWW Subdomain (www.haos.fm):**

```
Type: CNAME
Subdomain: www
Target: notesapp-dev-app.azurewebsites.net.
TTL: 3600
```

**For Music App (music.haos.fm) - Optional:**

```
Type: CNAME
Subdomain: music
Target: notesapp-dev-music-app.azurewebsites.net.
TTL: 3600
```

#### 2.3 Get Azure App Service IP Address

```bash
# Get the IP address for A record
az webapp show \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --query "outboundIpAddresses" -o tsv | cut -d',' -f1
```

Or check in Portal:
- App Service → Properties → Virtual IP address

#### 2.4 DNS Configuration Summary

Your OVH DNS zone should look like this:

| Type  | Subdomain | Target/Value                           | TTL  |
|-------|-----------|----------------------------------------|------|
| A     | @         | `<Azure_IP_Address>`                   | 3600 |
| TXT   | asuid     | `<Azure_Verification_Code>`            | 3600 |
| CNAME | www       | notesapp-dev-app.azurewebsites.net.    | 3600 |
| CNAME | music     | notesapp-dev-music-app.azurewebsites.net. | 3600 |

### Step 3: Enable SSL Certificate

#### 3.1 Wait for DNS Propagation

```bash
# Check DNS propagation (wait until these resolve)
nslookup haos.fm
nslookup www.haos.fm

# Or use online tool
open https://www.whatsmydns.net/#A/haos.fm
```

DNS propagation typically takes: **15 minutes to 48 hours** (usually under 1 hour with OVH)

#### 3.2 Add Managed SSL Certificate in Azure

**Via Portal:**
1. Go to: **App Services** → **notesapp-dev-app**
2. Left menu → **TLS/SSL settings**
3. Click **Private Key Certificates (.pfx)**
4. Click **+ Create App Service Managed Certificate**
5. Select your custom domain: `haos.fm`
6. Click **Create**

**Via CLI:**
```bash
# Create managed SSL certificate
az webapp config ssl create \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --hostname haos.fm

# Bind SSL certificate
az webapp config ssl bind \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

#### 3.3 Enable HTTPS Only

```bash
# Force HTTPS redirect
az webapp update \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --https-only true
```

### Step 4: Update Application Configuration

#### 4.1 Update Environment Variables

```bash
# Set custom domain in app settings
az webapp config appsettings set \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --settings \
    WEBSITE_HOSTNAME="haos.fm" \
    DOMAIN="haos.fm"
```

#### 4.2 Update CORS Settings (if needed)

```bash
# Add your domain to allowed origins
az webapp cors add \
  --name notesapp-dev-app \
  --resource-group notesapp-dev-rg \
  --allowed-origins "https://haos.fm" "https://www.haos.fm"
```

---

## 🌟 Option B: Deploy to Vercel

### Why Vercel?
- ✅ Free SSL certificates
- ✅ Global CDN (faster worldwide)
- ✅ Easy deployment from GitHub
- ❌ Limited backend capabilities
- ❌ WebSocket support requires upgrade

### Step 1: Deploy to Vercel

#### 1.1 Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

#### 1.2 Deploy from Repository

```bash
# Navigate to project
cd /Users/haos/Projects/azure-psql-app

# Deploy to Vercel
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: haos-fm
# - Directory: ./
# - Override settings? No
```

Or use the Vercel Dashboard:

1. Go to: https://vercel.com/new
2. Import Git Repository: `kozuchowskihubert/azure-psql-app`
3. Configure Project:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** `cd app && npm install`
   - **Output Directory:** `app/public`
   - **Install Command:** `npm install`

4. Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<your_postgres_connection_string>
   SESSION_SECRET=<generate_random_secret>
   ```

5. Click **Deploy**

#### 1.3 Configure Custom Domain in Vercel

**Via Vercel Dashboard:**

1. Go to your project: https://vercel.com/dashboard
2. Select your project → **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `haos.fm`
5. Vercel will show DNS records to add

**Via CLI:**

```bash
# Add custom domain
vercel domains add haos.fm

# Add www subdomain
vercel domains add www.haos.fm
```

### Step 2: Configure DNS in OVH

Add these records in OVH DNS Manager:

**For Vercel:**

```
Type: A
Subdomain: @
Target: 76.76.21.21
TTL: 3600

Type: CNAME
Subdomain: www
Target: cname.vercel-dns.com.
TTL: 3600
```

### Step 3: Verify Deployment

```bash
# Check deployment status
vercel ls

# Check domain
vercel domains ls
```

---

## 🏠 Option C: Deploy to OVH Hosting

### Why OVH Hosting?
- ✅ Everything in one place
- ✅ Included with domain
- ❌ Limited Node.js support
- ❌ Static files only (best for frontend)

### Step 1: Check OVH Hosting Plan

1. Go to: https://www.ovh.com/manager/#/hub
2. Navigate to: **Web Cloud** → **Hosting plans**
3. Check if you have hosting included with domain

### Step 2: Setup Node.js on OVH (if supported)

**Note:** OVH Web Hosting has limited Node.js support. Check your plan:
- **Performance:** Node.js 14+ supported
- **Pro/Premium:** Node.js supported
- **Personal/Starter:** Static files only

#### 2.1 Enable Node.js

1. In OVH Manager → Hosting → **FTP-SSH**
2. Enable SSH access
3. Note your SSH credentials

#### 2.2 Connect via SSH

```bash
# SSH to your OVH hosting
ssh <username>@<your-hosting>.hosting.ovh.net

# Navigate to web directory
cd www

# Clone your repository
git clone https://github.com/kozuchowskihubert/azure-psql-app.git
cd azure-psql-app/app

# Install dependencies
npm install --production

# Start application (if Node.js available)
node server.js
```

### Step 3: Static Deployment (Fallback)

If Node.js is not available, deploy static files:

#### 3.1 Build Static Version

```bash
# On your local machine
cd /Users/haos/Projects/azure-psql-app

# Create static build
mkdir -p dist
cp -r app/public/* dist/

# Optional: Add API redirect to Azure
# Create .htaccess in dist/
cat > dist/.htaccess << 'EOF'
RewriteEngine On
RewriteRule ^api/(.*)$ https://notesapp-dev-app.azurewebsites.net/api/$1 [P,L]
EOF
```

#### 3.2 Upload via FTP

1. Get FTP credentials from OVH Manager
2. Use FileZilla or command line:

```bash
# Install lftp if needed
brew install lftp

# Upload files
lftp -u <username> ftp.<your-hosting>.hosting.ovh.net
cd www
mirror -R dist/ ./
quit
```

### Step 4: Configure DNS

In OVH DNS Manager (same as Option A):

```
Type: A
Subdomain: @
Target: <OVH_Hosting_IP>
TTL: 3600

Type: CNAME  
Subdomain: www
Target: <your-hosting>.hosting.ovh.net.
TTL: 3600
```

---

## 🔒 SSL/TLS Configuration

### Automatic SSL (Recommended)

**Azure:** Managed certificates (free, auto-renew)
**Vercel:** Automatic SSL (free, instant)
**OVH:** Let's Encrypt (free, enable in manager)

### Enable SSL on OVH Hosting

1. OVH Manager → **Hosting plans** → Your hosting
2. Click **SSL certificate**
3. Choose: **Free SSL certificate (Let's Encrypt)**
4. Click **Activate**
5. Wait 10-15 minutes for activation

### Force HTTPS

Add to `.htaccess` (OVH) or configure in Azure/Vercel:

```apache
# .htaccess for OVH
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## ✅ Verification & Testing

### Step 1: DNS Propagation Check

```bash
# Check DNS records
dig haos.fm A
dig www.haos.fm CNAME
dig music.haos.fm CNAME

# Or use online tools
open https://www.whatsmydns.net/#A/haos.fm
open https://dnschecker.org/#A/haos.fm
```

### Step 2: SSL Certificate Check

```bash
# Check SSL certificate
openssl s_client -connect haos.fm:443 -servername haos.fm

# Or use online tool
open https://www.ssllabs.com/ssltest/analyze.html?d=haos.fm
```

### Step 3: Test All URLs

```bash
# Test main domain
curl -I https://haos.fm

# Test www redirect
curl -I https://www.haos.fm

# Test music subdomain
curl -I https://music.haos.fm

# Test HTTP to HTTPS redirect
curl -I http://haos.fm
```

### Step 4: Browser Testing

1. Open: https://haos.fm
2. Check: SSL padlock in browser
3. Verify: No mixed content warnings
4. Test: All pages load correctly
5. Check: API calls work (if applicable)

---

## 🎯 Recommended Configuration

### For Production (Best Performance):

```
┌─────────────────────────────────────────────────┐
│                   haos.fm                       │
│              (Root Domain - Azure)              │
│         Main App + Music Creator Hub            │
└─────────────────────────────────────────────────┘
                      ▼
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────┐          ┌────────────────┐
│  www.haos.fm  │          │ music.haos.fm  │
│   (Redirect)  │          │  (Azure App)   │
│   → haos.fm   │          │  Music Studio  │
└───────────────┘          └────────────────┘
```

### DNS Records Summary:

| Record | Name    | Type  | Value                                  |
|--------|---------|-------|----------------------------------------|
| ①      | @       | A     | Azure IP                               |
| ②      | www     | CNAME | notesapp-dev-app.azurewebsites.net     |
| ③      | music   | CNAME | notesapp-dev-music-app.azurewebsites.net|
| ④      | asuid   | TXT   | Azure verification code                |

---

## 🚀 Quick Start Script

Save this as `deploy-domain.sh`:

```bash
#!/bin/bash

# HAOS.fm Domain Configuration Script
# Usage: ./deploy-domain.sh <domain-name>

DOMAIN=${1:-haos.fm}
WEBAPP_NAME="notesapp-dev-app"
MUSIC_APP_NAME="notesapp-dev-music-app"
RG="notesapp-dev-rg"

echo "🚀 Configuring domain: $DOMAIN"
echo "================================"

# Step 1: Add custom domain to Azure
echo "📍 Step 1: Adding custom domain to Azure..."
az webapp config hostname add \
  --webapp-name $WEBAPP_NAME \
  --resource-group $RG \
  --hostname $DOMAIN

az webapp config hostname add \
  --webapp-name $WEBAPP_NAME \
  --resource-group $RG \
  --hostname www.$DOMAIN

# Step 2: Get verification info
echo "📍 Step 2: Getting DNS verification info..."
VERIFICATION=$(az webapp show \
  --name $WEBAPP_NAME \
  --resource-group $RG \
  --query "customDomainVerificationId" -o tsv)

echo ""
echo "🔍 DNS Records to add in OVH Manager:"
echo "======================================="
echo ""
echo "1. TXT Record:"
echo "   Name: asuid.$DOMAIN"
echo "   Value: $VERIFICATION"
echo ""
echo "2. CNAME Record:"
echo "   Name: www"
echo "   Value: $WEBAPP_NAME.azurewebsites.net"
echo ""
echo "3. CNAME Record (Music):"
echo "   Name: music"
echo "   Value: $MUSIC_APP_NAME.azurewebsites.net"
echo ""
echo "Add these records in OVH Manager, then wait 10-30 minutes"
echo ""

# Step 3: Wait for confirmation
read -p "Press Enter after adding DNS records..."

# Step 4: Enable HTTPS
echo "📍 Step 3: Enabling HTTPS..."
az webapp update \
  --name $WEBAPP_NAME \
  --resource-group $RG \
  --https-only true

echo ""
echo "✅ Configuration complete!"
echo "🌐 Your site will be live at: https://$DOMAIN"
echo ""
echo "Next steps:"
echo "1. Wait for DNS propagation (10-30 minutes)"
echo "2. Create managed SSL certificate in Azure Portal"
echo "3. Test: https://$DOMAIN"
```

Make it executable and run:

```bash
chmod +x deploy-domain.sh
./deploy-domain.sh haos.fm
```

---

## 📚 Additional Resources

### Documentation:
- [Azure Custom Domains](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain)
- [Azure SSL Certificates](https://learn.microsoft.com/en-us/azure/app-service/configure-ssl-certificate)
- [OVH DNS Configuration](https://docs.ovh.com/gb/en/domains/web_hosting_how_to_edit_my_dns_zone/)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

### Troubleshooting:
- DNS not resolving → Wait longer, check TTL
- SSL errors → Clear browser cache, wait for cert propagation
- 404 errors → Check domain binding in Azure
- Mixed content → Update API URLs to HTTPS

### Support:
- OVH Support: https://www.ovh.com/manager/#/support
- Azure Support: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade
- GitHub Issues: https://github.com/kozuchowskihubert/azure-psql-app/issues

---

**🎉 Your HAOS.fm domain will be live soon!**

Need help? Check the troubleshooting section or create an issue on GitHub.
