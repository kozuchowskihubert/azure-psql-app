#!/bin/zsh
# Authenticate to Azure using az CLI, supporting both interactive and service principal login via .env.local

ENV_FILE="azure-psql-app/infra/.env.local"

# Load variables from .env.local
if [ -f "$ENV_FILE" ]; then
    source <(grep -E '^(spn_password|spn_client_id|spn_tenant_id)=' "$ENV_FILE" | sed 's/^/export /')
    EMAIL=$(grep -E '^[^#].+@.+\..+' "$ENV_FILE" | head -n 1)
else
    echo ".env.local not found!"
    exit 1
fi

if [[ -n "$spn_password" && -n "$spn_client_id" && -n "$spn_tenant_id" ]]; then
    echo "Authenticating with Azure using Service Principal..."
    az login --service-principal -u "$spn_client_id" -p "$spn_password" --tenant "$spn_tenant_id"
else
    if [[ -n "$EMAIL" ]]; then
        echo "Authenticating interactively for user: $EMAIL"
        az login -u "$EMAIL"
    else
        echo "No credentials found in .env.local. Please provide either SPN credentials or your Azure email."
        exit 1
    fi
fi
