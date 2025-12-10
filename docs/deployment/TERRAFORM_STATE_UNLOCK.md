# 🔓 Terraform State Lock Resolution

## Problem
Your Terraform state file is locked from a previous operation that didn't complete properly.

**Lock Details:**
- **Lock ID:** `5f195d83-da77-abc3-31d8-834e3df22daf`
- **State Path:** `tfstate-music/terraform-music.tfstate`
- **Locked By:** `runner@runnervmg1sw1` (GitHub Actions runner)
- **Operation:** Apply
- **When:** 2025-11-26 16:53:04 UTC

## ⚡ Solution 1: Force Unlock (Recommended)

### Option A: Unlock from Local Machine

```bash
# Navigate to the music-tf directory
cd /Users/haos/Projects/azure-psql-app/music-tf

# Force unlock using the Lock ID
terraform force-unlock 5f195d83-da77-abc3-31d8-834e3df22daf

# When prompted, type 'yes' to confirm
```

### Option B: Unlock from Azure Portal

1. **Login to Azure Portal**
   ```bash
   az login
   ```

2. **Navigate to Storage Account**
   - Go to [Azure Portal](https://portal.azure.com)
   - Find your storage account containing Terraform state
   - Navigate to: Storage Account → Containers → `tfstate-music`

3. **Break the Lease**
   - Click on `terraform-music.tfstate`
   - Click "Break lease" button
   - Confirm the action

### Option C: Using Azure CLI

```bash
# Set variables
STORAGE_ACCOUNT="your-storage-account-name"
CONTAINER="tfstate-music"
BLOB="terraform-music.tfstate"

# Break the lease
az storage blob lease break \
  --account-name $STORAGE_ACCOUNT \
  --container-name $CONTAINER \
  --blob-name $BLOB
```

## 🔍 Solution 2: Check Running Operations

Before force-unlocking, verify no operations are actually running:

```bash
# Check GitHub Actions workflows
gh run list --repo kozuchowskihubert/azure-psql-app --limit 5

# Check if any workflows are running
gh run list --repo kozuchowskihubert/azure-psql-app --status in_progress
```

If workflows are running:
1. **Cancel them first:**
   ```bash
   gh run cancel <RUN_ID>
   ```
2. **Then unlock the state**

## 📋 Step-by-Step Resolution

### Step 1: Verify the Lock

```bash
cd /Users/haos/Projects/azure-psql-app/music-tf

# Try to run terraform plan to see the lock error
terraform plan
```

### Step 2: Check for Active Workflows

```bash
# List recent workflow runs
gh run list --repo kozuchowskihubert/azure-psql-app --limit 10

# Check specifically for in-progress runs
gh run list --repo kozuchowskihubert/azure-psql-app --status in_progress
```

### Step 3: Cancel Any Running Workflows

If you see active workflows:
```bash
# Cancel a specific run
gh run cancel <RUN_ID>

# Or cancel all in-progress runs (careful!)
gh run list --repo kozuchowskihubert/azure-psql-app --status in_progress --json databaseId --jq '.[].databaseId' | xargs -I {} gh run cancel {}
```

### Step 4: Force Unlock

```bash
# Force unlock with the Lock ID
terraform force-unlock 5f195d83-da77-abc3-31d8-834e3df22daf

# Type 'yes' when prompted
```

### Step 5: Verify Unlock Success

```bash
# Try running terraform plan again
terraform plan

# If successful, you should see the plan without lock errors
```

## 🚨 Prevention - Best Practices

### 1. Always Use Proper Workflow Cancellation

Don't just kill terminal processes or cancel GitHub Actions mid-run. Use:
```bash
# Local operations
Ctrl+C (and wait for cleanup)

# GitHub Actions
gh run cancel <RUN_ID>  # Not the red "X" button
```

### 2. Add Timeouts to GitHub Actions

Update your `.github/workflows/*.yml` files:

```yaml
jobs:
  deploy:
    timeout-minutes: 30  # Add this
    steps:
      - name: Terraform Apply
        timeout-minutes: 15  # And this
        run: terraform apply -auto-approve
```

### 3. Enable Auto-Unlock for CI/CD

Add to your Terraform backend configuration:

```hcl
terraform {
  backend "azurerm" {
    # ... other config ...
    
    # Auto-unlock after 20 minutes
    lock_timeout = "20m"
  }
}
```

### 4. Use Terraform Workspaces

For multiple environments, use workspaces instead of separate state files:

```bash
terraform workspace new production
terraform workspace new staging
terraform workspace select production
```

## 🔧 Alternative: Manual Azure Portal Method

If CLI methods fail:

1. **Go to Azure Portal:** https://portal.azure.com
2. **Navigate to Storage Account:**
   - Search for your storage account
   - Click on "Containers"
   - Find and click `tfstate-music`
3. **Select the blob:**
   - Click on `terraform-music.tfstate`
4. **Break the lease:**
   - In the blob overview, look for "Lease state: Locked"
   - Click "Break lease" button
   - Confirm

## 📝 Quick Reference Commands

```bash
# 1. Navigate to terraform directory
cd /Users/haos/Projects/azure-psql-app/music-tf

# 2. Check for running workflows
gh run list --repo kozuchowskihubert/azure-psql-app --status in_progress

# 3. Cancel any running workflows (if needed)
gh run cancel <RUN_ID>

# 4. Force unlock
terraform force-unlock 5f195d83-da77-abc3-31d8-834e3df22daf

# 5. Verify
terraform plan

# 6. Continue with your work
terraform apply
```

## ⚠️ Important Notes

- **Lock ID is unique:** Use the exact Lock ID from your error message
- **Check twice, unlock once:** Make sure no operations are running
- **Team communication:** If working in a team, notify others before unlocking
- **State corruption:** Force unlock is safe, but check the state after

## 🆘 If Problems Persist

1. **Check Azure Storage Account permissions:**
   ```bash
   az storage account show --name <storage-account> --query provisioningState
   ```

2. **Verify backend configuration:**
   ```bash
   cat music-tf/main.tf | grep -A 10 "backend"
   ```

3. **Re-initialize Terraform:**
   ```bash
   rm -rf .terraform
   terraform init -reconfigure
   ```

4. **Contact team:** Check if someone else is running operations

---

**Need Help?** Check the [Terraform State Documentation](https://www.terraform.io/docs/language/state/locking.html)
