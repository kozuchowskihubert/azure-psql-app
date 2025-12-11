# 🚀 Azure Blob Storage - Quick Setup for HAOS.fm

**Last Updated:** December 11, 2025  
**Purpose:** Store uploaded audio tracks for haos.fm radio player

---

## ⚡ Quick Start (5 minutes)

### Step 1: Create Azure Storage (Azure Portal - Easiest)

1. **Go to:** https://portal.azure.com
2. **Click:** "Create a resource" → Search "Storage account" → Create
3. **Settings:**
   - **Name:** `haosfmtracks` (must be globally unique)
   - **Region:** Choose closest (e.g., West Europe, East US)
   - **Performance:** Standard
   - **Redundancy:** LRS (cheapest)
4. **Click:** "Review + create" → "Create" (wait 1-2 min)

### Step 2: Get Connection String

1. **Go to:** Your new storage account
2. **Click:** "Access keys" (left menu under Security)
3. **Copy:** Connection string from "key1" (click Show → Copy)

It looks like this:
```
DefaultEndpointsProtocol=https;AccountName=haosfmtracks;AccountKey=XXXX==;EndpointSuffix=core.windows.net
```

### Step 3: Create Container

1. **In storage account, click:** "Containers" (left menu)
2. **Click:** "+ Container"
3. **Settings:**
   - **Name:** `tracks`
   - **Public access level:** "Blob (anonymous read access for blobs only)"
4. **Click:** "Create"

### Step 4: Add to Vercel

**Option A: Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/hubertkozuchowski-3144s-projects/haos-fm/settings/environment-variables
2. Add these variables (click "Add Another" for each):

| Name | Value | Environments |
|------|-------|--------------|
| `AZURE_STORAGE_CONNECTION_STRING` | [Paste your connection string] | Production, Preview, Development |
| `AZURE_STORAGE_CONTAINER_NAME` | `tracks` | Production, Preview, Development |

3. Click "Save"

**Option B: Using CLI**

```bash
cd /Users/haos/azure-psql-app

# Add connection string (paste when prompted)
vercel env add AZURE_STORAGE_CONNECTION_STRING production
vercel env add AZURE_STORAGE_CONNECTION_STRING preview

# Add container name (type 'tracks' when prompted)
vercel env add AZURE_STORAGE_CONTAINER_NAME production
vercel env add AZURE_STORAGE_CONTAINER_NAME preview
```

### Step 5: Deploy

```bash
cd /Users/haos/azure-psql-app
vercel --prod
```

### Step 6: Test

1. Go to https://haos.fm
2. Click upload button (🎵 icon)
3. Upload an MP3 file
4. Check if it appears in radio player
5. Verify in Azure Portal: Storage → Containers → tracks

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Storage account created in Azure Portal
- [ ] Container "tracks" exists with public blob access
- [ ] Connection string copied correctly
- [ ] Both environment variables added to Vercel
- [ ] New deployment triggered
- [ ] Test upload succeeds
- [ ] File visible in Azure Portal container
- [ ] Track plays in radio player

---

## 🎯 Current Status Check

Run this to see if Vercel has the variables:

```bash
cd /Users/haos/azure-psql-app
vercel env ls
```

You should see:
```
✓ AZURE_STORAGE_CONNECTION_STRING (Production, Preview)
✓ AZURE_STORAGE_CONTAINER_NAME (Production, Preview)
```

---

## 💰 Costs

**Azure Blob Storage:**
- Storage: $0.02 per GB/month
- 100 tracks (5MB each) = 500MB = **$0.01/month**
- Essentially FREE for moderate use

**Free tier includes:**
- First 5 GB storage
- 20,000 read operations
- 2,000 write operations

---

## 🔧 Troubleshooting

### "No uploaded tracks" after setup

**Fix:** Verify environment variables are set in Vercel:
```bash
vercel env ls
```

Then redeploy:
```bash
vercel --prod
```

### Upload fails with 403 error

**Fix:** Check container access level:
1. Azure Portal → Storage → Containers → tracks
2. Click "Change access level"
3. Select "Blob (anonymous read access for blobs only)"

### Files upload but won't play

**Fix:** Enable CORS:
1. Azure Portal → Storage → Resource sharing (CORS)
2. Blob service → Add rule:
   ```
   Allowed origins: *
   Allowed methods: GET, HEAD, OPTIONS
   Allowed headers: *
   Exposed headers: *
   Max age: 3600
   ```

---

## 📖 Full Documentation

For detailed information, see: `/docs/AZURE_BLOB_STORAGE_SETUP.md`

## 🆘 Need Help?

1. Check Azure Portal for storage account status
2. Verify Vercel environment variables: https://vercel.com/dashboard
3. Check deployment logs: `vercel logs haos.fm`
4. GitHub Issues: https://github.com/kozuchowskihubert/azure-psql-app/issues

---

**Ready to start uploading tracks? Follow the steps above! 🎵**
