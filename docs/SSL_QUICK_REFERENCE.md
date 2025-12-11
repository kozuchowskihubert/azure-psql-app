# Azure SSL Certificate Quick Reference

## 🚀 Quick Start (Recommended Method)

### Option 1: Automated Script

```bash
# Set your custom domain
export CUSTOM_DOMAIN="haos.fm"
export AZURE_RESOURCE_GROUP="haos-rg"
export AZURE_APP_NAME="haos-platform"

# Run the setup script
./scripts/setup-azure-ssl.sh
```

### Option 2: Terraform (Infrastructure as Code)

```bash
cd infra

# Initialize Terraform
terraform init

# Configure variables
cat > terraform.tfvars << EOF
custom_domain = "haos.fm"
ssl_cert_email = "admin@haos.fm"
enable_frontdoor = false
EOF

# Apply configuration
terraform plan
terraform apply
```

### Option 3: Azure CLI (Manual)

```bash
# Login to Azure
az login

# Set variables
RG="haos-rg"
APP="haos-platform"
DOMAIN="haos.fm"

# Add custom domain
az webapp config hostname add \
  --webapp-name $APP \
  --resource-group $RG \
  --hostname $DOMAIN

# Create managed certificate (FREE)
az webapp config ssl create \
  --name $APP \
  --resource-group $RG \
  --hostname $DOMAIN

# Enable HTTPS only
az webapp update \
  --name $APP \
  --resource-group $RG \
  --https-only true
```

---

## 📋 DNS Configuration Required

Before running the setup, configure these DNS records:

### For Root Domain (haos.fm)

```
Type: TXT
Host: asuid.haos.fm
Value: <verification-id-from-azure>
TTL: 3600

Type: A (or ALIAS)
Host: @
Value: <app-service-ip>
TTL: 3600
```

### For WWW Subdomain

```
Type: CNAME
Host: www
Value: haos-platform.azurewebsites.net
TTL: 3600
```

**Get verification ID:**
```bash
az webapp show \
  --name haos-platform \
  --resource-group haos-rg \
  --query customDomainVerificationId -o tsv
```

---

## 🔒 Certificate Options Comparison

| Feature | App Service Managed | Front Door | Let's Encrypt | Purchased |
|---------|-------------------|------------|---------------|-----------|
| **Cost** | FREE ✅ | FREE ✅ | FREE ✅ | $75-300/year |
| **Auto-renewal** | Yes ✅ | Yes ✅ | Yes* ✅ | Yes ✅ |
| **Setup time** | 5 minutes | 10 minutes | 30 minutes | 1 hour |
| **CDN included** | No | Yes ✅ | No | No |
| **Wildcard support** | No | Yes ✅ | Yes ✅ | Yes ✅ |
| **DDoS protection** | Basic | Advanced ✅ | No | No |

*Requires certbot auto-renewal setup

---

## ✅ Verification Steps

### 1. Check Certificate Status

```bash
# List certificates
az webapp config ssl list --resource-group haos-rg

# Check binding
az webapp config hostname list \
  --webapp-name haos-platform \
  --resource-group haos-rg
```

### 2. Test HTTPS Connection

```bash
# Test with curl
curl -I https://haos.fm

# Check certificate details
openssl s_client -connect haos.fm:443 -servername haos.fm
```

### 3. SSL Labs Test

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=haos.fm

**Target Grade: A or A+**

---

## 🔧 Troubleshooting

### Certificate Not Binding

```bash
# Check DNS propagation
dig haos.fm
nslookup haos.fm

# Verify domain ownership
az webapp config hostname list --webapp-name haos-platform --resource-group haos-rg

# Check App Service logs
az webapp log tail --name haos-platform --resource-group haos-rg
```

### Mixed Content Warnings

Add to `app.js`:

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.hostname + req.url);
    }
    next();
  });
}
```

### DNS Not Resolving

```bash
# Wait for DNS propagation (can take up to 48 hours)
# Check status:
dig +trace haos.fm

# Force DNS refresh (macOS)
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

---

## 📊 Monitoring

### Certificate Expiration Alert

Already configured if you used the automated script or Terraform.

**Manual setup:**

```bash
az monitor metrics alert create \
  --name ssl-cert-expiring \
  --resource-group haos-rg \
  --scopes "/subscriptions/<sub-id>/resourceGroups/haos-rg/providers/Microsoft.Web/sites/haos-platform" \
  --condition "avg Certificate.DaysUntilExpiry < 30" \
  --description "SSL certificate expires soon" \
  --action cert-expiry-alerts
```

### Check Certificate Expiry

```bash
# Via Azure CLI
az webapp config ssl list \
  --resource-group haos-rg \
  --query "[].expirationDate" -o table

# Via OpenSSL
echo | openssl s_client -servername haos.fm -connect haos.fm:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔐 Security Best Practices

### 1. Enable HSTS

```javascript
// In app.js
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
```

### 2. Minimum TLS Version

```bash
az webapp config set \
  --name haos-platform \
  --resource-group haos-rg \
  --min-tls-version "1.2"
```

### 3. Security Headers

```javascript
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

---

## 💰 Cost Estimates

### Recommended Setup (App Service + Managed Certificate)

- **App Service Plan:** $55-200/month (Basic B1 - Standard S1)
- **SSL Certificate:** FREE ✅
- **Bandwidth:** Included (first 5GB free, then $0.087/GB)
- **Custom Domain:** Your registrar's fee (~$10-15/year)

**Total: ~$55-200/month**

### With Azure Front Door (Optional)

- **Front Door:** $35/month base + $0.011/GB
- **SSL Certificate:** FREE ✅
- **DDoS Protection:** Included ✅
- **WAF:** $200/month (optional)

**Total: ~$90-435/month (with CDN + security)**

---

## 📚 Resources

- [Azure SSL Documentation](https://docs.microsoft.com/azure/app-service/configure-ssl-certificate)
- [Let's Encrypt Guide](https://letsencrypt.org/getting-started/)
- [SSL Best Practices](https://docs.microsoft.com/security/engineering/tls-best-practices)
- [SSL Labs Testing](https://www.ssllabs.com/ssltest/)

---

## 🆘 Support

If you encounter issues:

1. Check Azure Portal → App Service → Diagnose and solve problems
2. Review logs: `az webapp log tail --name haos-platform --resource-group haos-rg`
3. Contact Azure Support: https://azure.microsoft.com/support/
4. Community forums: https://stackoverflow.com/questions/tagged/azure-app-service

---

**Last Updated:** December 11, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
