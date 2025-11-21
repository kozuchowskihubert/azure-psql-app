#!/bin/bash
# Script to delete all failed workflow runs from GitHub Actions

REPO="kozuchowskihubert/azure-psql-app"

echo "Fetching failed workflow runs..."

# Get all failed runs and delete them
gh run list --repo "$REPO" --status failure --json databaseId --limit 100 | \
  jq -r '.[].databaseId' | \
  while read -r run_id; do
    echo "Deleting run $run_id..."
    gh run delete "$run_id" --repo "$REPO" 2>/dev/null && echo "✓ Deleted" || echo "✗ Failed to delete"
  done

echo ""
echo "Checking for cancelled runs..."

# Also delete cancelled runs
gh run list --repo "$REPO" --status cancelled --json databaseId --limit 100 | \
  jq -r '.[].databaseId' | \
  while read -r run_id; do
    echo "Deleting run $run_id..."
    gh run delete "$run_id" --repo "$REPO" 2>/dev/null && echo "✓ Deleted" || echo "✗ Failed to delete"
  done

echo ""
echo "Done! Remaining runs:"
gh run list --repo "$REPO" --limit 10
