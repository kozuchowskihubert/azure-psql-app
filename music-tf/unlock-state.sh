#!/bin/bash
# Terraform State Lock Resolution Script
# For music-tf infrastructure

set -e

MUSIC_TF_DIR="/Users/haos/azure-psql-app/music-tf"

echo "🔓 Terraform State Lock Resolution"
echo "=================================="
echo ""
echo "Directory: $MUSIC_TF_DIR"
echo "State: tfstate-music/terraform-music.tfstate"
echo ""

cd "$MUSIC_TF_DIR"

echo "1️⃣ Checking Terraform state status..."
terraform state list 2>&1 | head -20 || echo "   (State locked or error)"

echo ""
echo "2️⃣ Options to resolve state lock:"
echo ""
echo "   A) Force unlock (if you're sure no other operation is running)"
echo "   B) Wait for current operation to complete"
echo "   C) Check Azure Storage for lease status"
echo ""

read -p "Do you want to force unlock? (yes/no): " response

if [ "$response" = "yes" ]; then
    echo ""
    echo "⚠️  To force unlock, you need the LOCK_ID from the error message."
    echo ""
    read -p "Enter the LOCK_ID (or 'skip' to cancel): " lock_id
    
    if [ "$lock_id" != "skip" ] && [ -n "$lock_id" ]; then
        echo ""
        echo "🔓 Attempting to force unlock with ID: $lock_id"
        terraform force-unlock "$lock_id"
        echo "✅ Unlock complete!"
    else
        echo "⏭️  Skipped force unlock"
    fi
else
    echo ""
    echo "📋 Alternative solutions:"
    echo ""
    echo "Manual unlock via Azure CLI:"
    echo "----------------------------"
    echo "az storage blob lease break \\"
    echo "  --account-name tfstatenotesapp \\"
    echo "  --container-name tfstate-music \\"
    echo "  --blob-name terraform-music.tfstate"
    echo ""
    echo "Check lock status:"
    echo "-----------------"
    echo "az storage blob show \\"
    echo "  --account-name tfstatenotesapp \\"
    echo "  --container-name tfstate-music \\"
    echo "  --name terraform-music.tfstate \\"
    echo "  --query '{leaseState: properties.lease.state, leaseStatus: properties.lease.status}'"
    echo ""
fi

echo ""
echo "3️⃣ Testing Terraform access..."
terraform init -reconfigure

echo ""
echo "✅ Done!"
echo ""
echo "Next steps:"
echo "  - Run: terraform plan"
echo "  - Or: terraform apply"
