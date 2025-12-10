#!/bin/bash
# =============================================================================
# Terraform State Lock Unlock Script
# =============================================================================
# Force unlocks a stuck Terraform state lock in Azure Blob Storage
#
# Usage:
#   ./scripts/unlock-terraform.sh <LOCK_ID>
#
# Example:
#   ./scripts/unlock-terraform.sh 22fe6710-aaaa-1ce1-7418-706dd253a89f
#
# Prerequisites:
#   - Azure CLI installed and logged in
#   - ARM_* environment variables set
#   - Or Azure credentials configured
# =============================================================================

set -e

LOCK_ID=${1:-""}

if [ -z "$LOCK_ID" ]; then
  echo "❌ Error: Lock ID is required"
  echo ""
  echo "Usage: $0 <LOCK_ID>"
  echo ""
  echo "Example:"
  echo "  $0 22fe6710-aaaa-1ce1-7418-706dd253a89f"
  echo ""
  echo "To find the lock ID, check the Terraform error message:"
  echo "  Lock Info:"
  echo "    ID: <this-is-the-lock-id>"
  exit 1
fi

echo "🔓 Terraform State Lock Unlock"
echo "================================"
echo ""
echo "Lock ID: $LOCK_ID"
echo "Working directory: infra/"
echo ""

cd "$(dirname "$0")/../infra" || exit 1

# Check if Terraform is initialized
if [ ! -d ".terraform" ]; then
  echo "⚠️ Terraform not initialized, initializing now..."
  terraform init
fi

echo "🔍 Attempting to force unlock..."
echo ""

# Force unlock
if terraform force-unlock -force "$LOCK_ID"; then
  echo ""
  echo "✅ Successfully unlocked Terraform state!"
  echo ""
  echo "Lock ID $LOCK_ID has been removed."
  echo "You can now run Terraform operations normally."
  exit 0
else
  echo ""
  echo "❌ Failed to unlock Terraform state"
  echo ""
  echo "Possible reasons:"
  echo "  1. Lock ID is incorrect"
  echo "  2. Lock has already been released"
  echo "  3. Azure credentials are not configured"
  echo "  4. Insufficient permissions"
  echo ""
  echo "Try checking if the lock still exists by running:"
  echo "  cd infra && terraform plan -lock=false"
  exit 1
fi
