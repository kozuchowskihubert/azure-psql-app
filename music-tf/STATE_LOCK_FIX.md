# Terraform State Lock Fix - music-tf

## Quick Fix Commands

### Option 1: Force Unlock (Fastest)
If you have the lock ID from the error message:

```bash
cd /Users/haos/azure-psql-app/music-tf
terraform force-unlock <LOCK_ID>
```

Replace `<LOCK_ID>` with the ID from your error message (looks like: `xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx`)

### Option 2: Break Lease via Azure CLI

```bash
az storage blob lease break \
  --account-name tfstatenotesapp \
  --container-name tfstate-music \
  --blob-name terraform-music.tfstate
```

### Option 3: Use the Unlock Script

```bash
cd /Users/haos/azure-psql-app/music-tf
./unlock-state.sh
```

This interactive script will guide you through the unlock process.

## Check Lock Status

```bash
az storage blob show \
  --account-name tfstatenotesapp \
  --container-name tfstate-music \
  --name terraform-music.tfstate \
  --query 'properties.lease'
```

## Reinitialize Terraform

After unlocking, reinitialize:

```bash
cd /Users/haos/azure-psql-app/music-tf
terraform init -reconfigure
```

## Common Causes

1. **Previous operation interrupted** - Ctrl+C during `terraform apply`
2. **CI/CD pipeline still running** - GitHub Actions workflow in progress
3. **Multiple terminals** - Terraform running in another terminal/session
4. **Stale lock** - Previous lock not properly released

## Prevention

- Always let Terraform operations complete
- Check GitHub Actions before running local Terraform
- Use `-lock-timeout` flag: `terraform apply -lock-timeout=5m`

## State File Location

- **Storage Account**: `tfstatenotesapp`
- **Container**: `tfstate-music`
- **Blob**: `terraform-music.tfstate`
- **Resource Group**: `notesapp-dev-rg`

## Verify After Fix

```bash
cd /Users/haos/azure-psql-app/music-tf
terraform state list
```

If this works without errors, the lock is released.
