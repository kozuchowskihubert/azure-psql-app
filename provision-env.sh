#!/bin/bash
# Script to provision .env file for Node.js app after Terraform deployment
# Usage: ./provision-env.sh

set -e

INFRA_DIR="$(dirname "$0")/azure-psql-app/infra"
ENV_PATH="$(dirname "$0")/azure-psql-app/app/.env"

# Get Terraform outputs as JSON
TF_OUTPUT=$(terraform -chdir="$INFRA_DIR" output -json)

# Extract values (update keys as per your outputs.tf)
DB_HOST=$(echo "$TF_OUTPUT" | jq -r '.psql_fqdn.value')
DB_USER=$(echo "$TF_OUTPUT" | jq -r '.psql_admin_username.value')
DB_PASS=$(echo "$TF_OUTPUT" | jq -r '.psql_admin_password.value')
DB_NAME=$(echo "$TF_OUTPUT" | jq -r '.psql_db_name.value')
DB_PORT=5432

# Compose connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Write .env file
cat > "$ENV_PATH" <<EOF
DATABASE_URL=${DATABASE_URL}
PORT=3000
EOF

echo ".env file provisioned at $ENV_PATH"
