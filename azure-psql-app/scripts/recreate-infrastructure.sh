#!/bin/bash
# Automation script to destroy and recreate Azure infrastructure in the correct region

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")/infra"

echo "========================================="
echo "Azure Infrastructure Recreation Script"
echo "========================================="
echo ""

# Change to infrastructure directory
cd "$INFRA_DIR"

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "Error: terraform.tfvars not found in $INFRA_DIR"
    exit 1
fi

# Prompt for confirmation
echo "This script will:"
echo "1. Destroy all existing Azure resources managed by Terraform"
echo "2. Recreate them in the West Europe region"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Destroy existing resources
echo "Step 1: Destroying existing resources..."
echo "========================================="
terraform destroy -auto-approve -var-file=terraform.tfvars

if [ $? -ne 0 ]; then
    echo "Error: Terraform destroy failed"
    exit 1
fi

echo ""
echo "Step 2: Cleaning up state..."
echo "========================================="
# Optional: Remove state backup files
rm -f terraform.tfstate.backup*

echo ""
echo "Step 3: Re-initializing Terraform..."
echo "========================================="
terraform init -upgrade

echo ""
echo "Step 4: Planning infrastructure in West Europe..."
echo "========================================="
terraform plan -var-file=terraform.tfvars -out=tfplan

echo ""
echo "Step 5: Applying infrastructure changes..."
echo "========================================="
terraform apply tfplan

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "SUCCESS: Infrastructure recreated!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update your Docker image in ACR"
    echo "2. Verify the application is running"
    echo "3. Update any GitHub Actions secrets if needed"
    echo ""
    terraform output
else
    echo ""
    echo "========================================="
    echo "ERROR: Infrastructure recreation failed"
    echo "========================================="
    exit 1
fi
