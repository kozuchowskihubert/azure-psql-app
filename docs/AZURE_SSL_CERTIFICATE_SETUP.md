# Azure SSL Certificate Setup Guide

This guide explains how to obtain and configure a legal SSL certificate for your HAOS platform using Azure services.

## Option 1: Azure App Service Managed Certificate (FREE & EASIEST)

### Prerequisites
- Azure App Service (Basic tier or higher)
- Custom domain name configured
- Domain DNS pointing to Azure App Service

### Steps

#### 1. Configure Custom Domain in Azure Portal

```bash
# Navigate to your App Service
az webapp config hostname add \
  --webapp-name haos-platform \
  --resource-group haos-rg \
  --hostname yourdomain.com
```

#### 2. Create Free Managed Certificate

1. Go to Azure Portal → Your App Service → **TLS/SSL settings**
2. Click **Private Key Certificates (.pfx)** tab
3. Click **+ Create App Service Managed Certificate**
4. Select your custom domain
5. Click **Create**

**Azure will automatically:**
- Issue a free SSL certificate from DigiCert
- Auto-renew every 6 months
- Bind to your custom domain
- No configuration needed!

#### 3. Bind Certificate to Domain

```bash
# Bind the managed certificate
az webapp config ssl bind \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI \
  --name haos-platform \
  --resource-group haos-rg
```

#### 4. Enforce HTTPS

```bash
# Redirect all HTTP to HTTPS
az webapp update \
  --name haos-platform \
  --resource-group haos-rg \
  --https-only true
```

---

## Option 2: Let's Encrypt Certificate (FREE)

### Using Certbot for Linux/Azure VM

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Using Azure Container Instances

```bash
# Create a container with Let's Encrypt automation
az container create \
  --resource-group haos-rg \
  --name letsencrypt-cert \
  --image certbot/certbot \
  --command-line "certbot certonly --standalone -d yourdomain.com --email admin@yourdomain.com --agree-tos --non-interactive" \
  --dns-name-label haos-certbot \
  --ports 80 443
```

---

## Option 3: Azure Key Vault Certificate (Advanced)

### 1. Import Certificate to Key Vault

```bash
# Create Key Vault if not exists
az keyvault create \
  --name haos-keyvault \
  --resource-group haos-rg \
  --location eastus

# Import certificate
az keyvault certificate import \
  --vault-name haos-keyvault \
  --name haos-ssl-cert \
  --file /path/to/certificate.pfx \
  --password <cert-password>
```

### 2. Configure App Service to Use Key Vault Certificate

```bash
# Enable managed identity for App Service
az webapp identity assign \
  --name haos-platform \
  --resource-group haos-rg

# Grant access to Key Vault
az keyvault set-policy \
  --name haos-keyvault \
  --object-id <app-service-principal-id> \
  --secret-permissions get \
  --certificate-permissions get

# Add certificate from Key Vault
az webapp config ssl import \
  --name haos-platform \
  --resource-group haos-rg \
  --key-vault haos-keyvault \
  --key-vault-certificate-name haos-ssl-cert
```

---

## Option 4: Purchase Certificate from Azure

### 1. Create App Service Certificate

```bash
# Create certificate purchase
az appservice certificate create \
  --name haos-ssl-cert \
  --resource-group haos-rg \
  --distinguished-name "CN=*.haos.fm" \
  --validity-in-months 12 \
  --auto-renew true
```

**Pricing:**
- Standard certificate: ~$75/year
- Wildcard certificate (*.domain.com): ~$300/year

### 2. Complete Domain Verification

1. Azure will send verification email to domain admin
2. Click verification link
3. Certificate will be issued within minutes

### 3. Bind to App Service

```bash
az webapp config ssl bind \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI \
  --name haos-platform \
  --resource-group haos-rg
```

---

## Recommended Setup for HAOS Platform

### Architecture with Azure Front Door + Managed Certificate

```bash
# 1. Create Azure Front Door
az afd profile create \
  --profile-name haos-frontdoor \
  --resource-group haos-rg \
  --sku Premium_AzureFrontDoor

# 2. Add custom domain
az afd custom-domain create \
  --profile-name haos-frontdoor \
  --resource-group haos-rg \
  --custom-domain-name haos-fm \
  --host-name haos.fm \
  --certificate-type ManagedCertificate

# 3. Configure endpoint
az afd endpoint create \
  --profile-name haos-frontdoor \
  --resource-group haos-rg \
  --endpoint-name haos-endpoint \
  --enabled-state Enabled
```

**Benefits:**
- ✅ FREE SSL certificate (Azure-managed)
- ✅ Automatic renewal
- ✅ Global CDN with 100+ edge locations
- ✅ DDoS protection
- ✅ WAF (Web Application Firewall)
- ✅ Load balancing
- ✅ 99.99% SLA

---

## Infrastructure as Code (Terraform)

```hcl
# Configure App Service with Managed Certificate
resource "azurerm_app_service_managed_certificate" "haos_cert" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.haos_binding.id
}

resource "azurerm_app_service_certificate_binding" "haos_binding" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.haos_binding.id
  certificate_id      = azurerm_app_service_managed_certificate.haos_cert.id
  ssl_state           = "SniEnabled"
}

resource "azurerm_app_service" "haos" {
  name                = "haos-platform"
  location            = azurerm_resource_group.haos.location
  resource_group_name = azurerm_resource_group.haos.name
  app_service_plan_id = azurerm_app_service_plan.haos.id

  https_only = true

  site_config {
    always_on        = true
    min_tls_version  = "1.2"
    ftps_state       = "FtpsOnly"
    
    # Force HTTPS redirect
    http2_enabled = true
  }
}
```

---

## DNS Configuration

### For Azure App Service

```
# Add CNAME record to your DNS provider
Type: CNAME
Host: www
Value: haos-platform.azurewebsites.net
TTL: 3600

# Add A record for root domain
Type: A
Host: @
Value: <App Service IP>
TTL: 3600

# Add TXT record for domain verification
Type: TXT
Host: asuid.yourdomain.com
Value: <verification-code-from-azure>
TTL: 3600
```

### For Azure Front Door

```
# CNAME for Front Door
Type: CNAME
Host: www
Value: haos-endpoint-xyz.azurefd.net
TTL: 3600

# CNAME for root domain (use ALIAS if supported)
Type: ALIAS/CNAME
Host: @
Value: haos-endpoint-xyz.azurefd.net
TTL: 3600
```

---

## Environment Variables for Production

```bash
# .env.production
NODE_ENV=production
PORT=443
FORCE_HTTPS=true
TRUST_PROXY=true

# Azure-specific
WEBSITE_NODE_DEFAULT_VERSION=18-lts
WEBSITES_ENABLE_APP_SERVICE_STORAGE=false
WEBSITE_HTTPLOGGING_RETENTION_DAYS=7

# SSL/TLS Configuration
SSL_CERT_PATH=/home/site/wwwroot/config/ssl/cert.pem
SSL_KEY_PATH=/home/site/wwwroot/config/ssl/key.pem
```

---

## Monitoring & Alerts

### Setup Certificate Expiration Alerts

```bash
# Create action group for alerts
az monitor action-group create \
  --name cert-expiry-alerts \
  --resource-group haos-rg \
  --short-name certexpiry \
  --email-receiver admin admin@haos.fm

# Create alert rule
az monitor metrics alert create \
  --name cert-expiring-soon \
  --resource-group haos-rg \
  --scopes /subscriptions/<sub-id>/resourceGroups/haos-rg/providers/Microsoft.Web/sites/haos-platform \
  --condition "avg Certificate.DaysUntilExpiry < 30" \
  --description "SSL certificate expires in less than 30 days" \
  --action cert-expiry-alerts
```

---

## Security Best Practices

### 1. TLS Configuration

```javascript
// server-https.js
const https = require('https');
const tls = require('tls');

const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  
  // Security settings
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  ciphers: [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
  ].join(':'),
  honorCipherOrder: true,
  
  // HSTS
  secureOptions: tls.SSL_OP_NO_TLSv1 | tls.SSL_OP_NO_TLSv1_1
};
```

### 2. Security Headers

```javascript
// Add to app.js
app.use((req, res, next) => {
  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // CSP
  res.setHeader('Content-Security-Policy', "default-src 'self' https:");
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});
```

---

## Cost Comparison

| Option | Cost | Auto-Renew | Management |
|--------|------|------------|------------|
| **App Service Managed** | FREE | ✅ Yes | Automatic |
| **Let's Encrypt** | FREE | ✅ Yes | Manual setup |
| **Azure Certificate** | $75-300/year | ✅ Yes | Automatic |
| **Front Door Managed** | FREE | ✅ Yes | Automatic |
| **Third-party (DigiCert)** | $200-1000/year | ❌ No | Manual |

---

## Quick Start: Deploy with Managed Certificate

```bash
#!/bin/bash
# deploy-with-ssl.sh

# Variables
RG="haos-rg"
APP="haos-platform"
DOMAIN="haos.fm"

# 1. Deploy app
az webapp up --name $APP --resource-group $RG --runtime "NODE|18-lts"

# 2. Map custom domain
az webapp config hostname add --webapp-name $APP --resource-group $RG --hostname $DOMAIN

# 3. Create managed certificate
az webapp config ssl create --name $APP --resource-group $RG --hostname $DOMAIN

# 4. Enable HTTPS only
az webapp update --name $APP --resource-group $RG --https-only true

echo "✅ SSL Certificate configured successfully!"
echo "🌐 Your site: https://$DOMAIN"
```

---

## Troubleshooting

### Certificate Not Binding

```bash
# Check certificate status
az webapp config ssl list --resource-group haos-rg

# Verify domain ownership
az webapp config hostname list --webapp-name haos-platform --resource-group haos-rg

# Check DNS propagation
nslookup haos.fm
dig haos.fm
```

### Mixed Content Warnings

```javascript
// Force all assets to HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}
```

---

## Next Steps

1. ✅ Choose certificate option (Recommended: App Service Managed Certificate)
2. ✅ Configure custom domain in Azure
3. ✅ Create/bind SSL certificate
4. ✅ Enable HTTPS-only mode
5. ✅ Test certificate: https://www.ssllabs.com/ssltest/
6. ✅ Setup monitoring and alerts
7. ✅ Update application to use HTTPS URLs

---

## Support & Resources

- [Azure App Service SSL Documentation](https://docs.microsoft.com/azure/app-service/configure-ssl-certificate)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [SSL Best Practices](https://docs.microsoft.com/security/engineering/tls-best-practices)
- [SSL Labs Testing](https://www.ssllabs.com/ssltest/)

---

**Created:** December 11, 2025  
**Updated:** December 11, 2025  
**Version:** 1.0
