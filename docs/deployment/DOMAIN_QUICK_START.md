# 🚀 HAOS.fm Domain Setup - Quick Reference

**Stop! Read this first before doing anything else.**

---

## ⚡ 3-Step Quick Start

### Step 1: Buy Domain (5 minutes)

**Go here NOW:**
```
https://www.namecheap.com/domains/registration/results/?domain=haos.fm
```

- **Price:** $89/year
- **Payment:** PayPal or Credit Card
- **Privacy:** FREE (enable WhoisGuard)
- **Click:** "Add to Cart" → Checkout → Complete Purchase

**Alternative (Cheaper):**
```
https://porkbun.com/checkout/search?q=haos.fm
```
- **Price:** $79/year ✅ Cheapest

### Step 2: Run Setup Script (Auto-pilot!)

```bash
cd /Users/haos/Projects/azure-psql-app
./scripts/setup-haos-domain.sh
```

The script will:
1. ✅ Get Azure verification code
2. ✅ Show you exactly what DNS records to add
3. ✅ Wait for you to configure DNS
4. ✅ Automatically add domain to Azure
5. ✅ Enable HTTPS
6. ✅ Give you SSL certificate instructions

### Step 3: Add SSL (5 minutes)

After script completes:

1. Go to: https://portal.azure.com
2. **App Services** → **notesapp-dev-app**
3. **TLS/SSL settings** → **+ Create App Service Managed Certificate**
4. Select **haos.fm** → **Create**
5. Repeat for **www.haos.fm**
6. Done! ✅

---

## 📋 Manual DNS Configuration (If needed)

**After buying domain, add these records in Namecheap:**

### Get Your Verification Code First:

```bash
az webapp show --name notesapp-dev-app --resource-group notesapp-dev-rg --query "customDomainVerificationId" -o tsv
```

### Add These Records:

**In Namecheap → Domain List → haos.fm → Manage → Advanced DNS:**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | asuid | [your verification code] | Automatic |
| CNAME | www | notesapp-dev-app.azurewebsites.net. | Automatic |
| ALIAS | @ | notesapp-dev-app.azurewebsites.net. | Automatic |
| CNAME | music | notesapp-dev-music-app.azurewebsites.net. | Automatic |

**Save** → Wait 10-30 minutes → Continue

---

## 🎯 Registrar Recommendations

| Best For | Registrar | Price | Link |
|----------|-----------|-------|------|
| **🏆 Best Overall** | Namecheap | $89/yr | [Buy Now](https://www.namecheap.com) |
| **💰 Cheapest** | Porkbun | $79/yr | [Buy Now](https://porkbun.com) |
| **⚡ Best Features** | Cloudflare | $85/yr | [Buy Now](https://dash.cloudflare.com) |
| **📅 Pay Later** | GoDaddy + Affirm | $99/yr | [Buy Now](https://www.godaddy.com) |

---

## ✅ Checklist

- [ ] Domain registered (Namecheap recommended)
- [ ] WhoisGuard privacy enabled
- [ ] DNS records added (TXT + CNAME + ALIAS)
- [ ] Waited 10-30 minutes for DNS propagation
- [ ] Ran `./scripts/setup-haos-domain.sh`
- [ ] Created SSL certificates in Azure Portal
- [ ] Tested https://haos.fm ✅
- [ ] Tested https://www.haos.fm ✅
- [ ] Tested https://music.haos.fm ✅

---

## 🆘 Quick Troubleshooting

**"Domain already taken"?**
- Try: haos-fm.com, haos.studio, gethaos.fm

**"Payment failed"?**
- Use PayPal instead of credit card
- Try different browser
- Contact Namecheap support (live chat 24/7)

**"DNS not propagating"?**
```bash
# Check status
nslookup haos.fm
nslookup www.haos.fm

# Check globally
open https://www.whatsmydns.net/#A/haos.fm
```
- Wait longer (up to 48 hours max, usually 30 min)

**"Can't add domain to Azure"?**
- Verify TXT record exists: `dig asuid.haos.fm TXT`
- Wait for full DNS propagation
- Check verification code is correct

**"SSL certificate failed"?**
- DNS must be fully propagated first
- Wait 30 minutes after DNS is working
- Try again in Azure Portal

---

## 📞 Support

**Namecheap:**
- Live Chat: https://www.namecheap.com/support/live-chat/
- Phone: 1-818-286-9888 (24/7)

**Azure:**
- Portal Support: https://portal.azure.com/#blade/Microsoft_Azure_Support
- Docs: https://learn.microsoft.com/azure/app-service/

**Script Issues:**
- GitHub: https://github.com/kozuchowskihubert/azure-psql-app/issues

---

## 💡 Pro Tips

1. **Use Namecheap** - Best balance of price, features, support
2. **Enable auto-renew** - Don't lose your domain
3. **Add all subdomains** - www, music, api, etc.
4. **Test incognito** - Avoid browser cache issues
5. **Save verification code** - You'll need it for future subdomains

---

## ⏱️ Timeline

| Step | Time | Action |
|------|------|--------|
| **Now** | 5 min | Buy domain on Namecheap |
| **+5 min** | 5 min | Add DNS records |
| **+15 min** | - | Wait for DNS propagation |
| **+15 min** | 2 min | Run setup script |
| **+17 min** | 5 min | Create SSL certificates |
| **+22 min** | - | Wait for SSL provisioning |
| **+30 min** | - | **DONE! Site is live** ✅ |

---

## 🎉 Final Commands

```bash
# 1. Buy domain (manual)
open https://www.namecheap.com/domains/registration/results/?domain=haos.fm

# 2. Run setup (automated)
cd /Users/haos/Projects/azure-psql-app
./scripts/setup-haos-domain.sh

# 3. Create SSL (manual)
open https://portal.azure.com

# 4. Test
open https://haos.fm
```

---

**Total Cost: $79-89/year**
**Total Time: ~30 minutes**
**Difficulty: Easy** 🟢

**Let's go! Register that domain now! 🚀**
