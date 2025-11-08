# --- Variables ---
APP_DIR := azure-psql-app/app
INFRA_DIR := azure-psql-app/infra
DOCKER_IMAGE := azure-psql-app:local
CONTAINER := azure-psql-app-local
PORT := 3000

.PHONY: help install test ui docker-build docker-run docker-stop infra-init infra-apply infra-destroy clean authenticate ensure-subscription terraform-install full-launch
	az-authenticate
# --- Initial Azure Authentication ---
az-authenticate:
	@echo "Authenticating to Azure interactively..."
	pwsh -c 'Connect-AzAccount'

# --- Help ---
help:
	@echo "Available targets:"
	@echo "  install             Install npm dependencies in $(APP_DIR)"
	@echo "  test                Run DB connection test and app tests"
	@echo "  ui                  Run the app with basic UI (npm start)"
	@echo "  docker-build        Build Docker image ($(DOCKER_IMAGE))"
	@echo "  docker-run          Run Docker container ($(CONTAINER))"
	@echo "  docker-stop         Stop and remove the local container"
	@echo "  infra-init          Run 'terraform init' in $(INFRA_DIR)"
	@echo "  infra-apply         Run 'terraform apply' in $(INFRA_DIR)"
	@echo "  infra-destroy       Run 'terraform destroy' in $(INFRA_DIR)"
	@echo "  clean               Remove local docker container and image"
	@echo "  authenticate        Authenticate to Azure using az-login.sh"
	@echo "  ensure-subscription Check and set Azure subscription context"
	@echo "  terraform-install   Install Terraform CLI (macOS)"
	@echo "  full-launch         Complete build, infra, and app start"

# --- App Setup & UI ---
install:
	@echo "Installing npm dependencies in $(APP_DIR)"
	cd $(APP_DIR) && npm install

ui:
	@echo "Starting app with basic UI from $(APP_DIR)"
	cd $(APP_DIR) && npm start

test:
	@echo "Running DB connection test and app tests"
	cd $(APP_DIR) && npm test
	node $(APP_DIR)/test/db-connection-test.js

# --- Docker ---
docker-build:
	@echo "Building docker image $(DOCKER_IMAGE) from azure-psql-app/ (Dockerfile location)"
	docker build -t $(DOCKER_IMAGE) -f azure-psql-app/Dockerfile azure-psql-app/

docker-run:
	@if [ -z "$(DATABASE_URL)" ]; then echo "Set DATABASE_URL before running docker-run (export DATABASE_URL=...)" && exit 1; fi
	@echo "Running container $(CONTAINER)"
	@docker rm -f $(CONTAINER) >/dev/null 2>&1 || true
	docker run -d --name $(CONTAINER) -p $(PORT):3000 -e DATABASE_URL="$(DATABASE_URL)" $(DOCKER_IMAGE)

docker-stop:
	@echo "Stopping and removing container $(CONTAINER)"
	docker rm -f $(CONTAINER) || true

# --- Terraform Infra ---
infra-init:
	@echo "Initializing terraform in $(INFRA_DIR)"
	cd $(INFRA_DIR) && terraform init

infra-apply:
	@echo "Applying terraform in $(INFRA_DIR)"
	cd $(INFRA_DIR) && terraform apply -auto-approve

infra-destroy:
	@echo "Destroying terraform resources in $(INFRA_DIR)"
	cd $(INFRA_DIR) && terraform destroy -auto-approve

# --- Clean ---
clean: docker-stop
	@echo "Removing docker image $(DOCKER_IMAGE)"
	docker rmi -f $(DOCKER_IMAGE) || true

# --- Azure Authentication & Subscription ---
authenticate:
	@echo "Authenticating to Azure using az-login.sh..."
	zsh ./az-login.sh

ensure-subscription:
	@echo "Checking for Azure subscription..."
	@if [ ! -f azure-psql-app/infra/.azure-subscription ]; then \
		echo "No subscription file found. Please create a subscription in the Azure Portal:"; \
		echo "https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade"; \
		echo "After creation, add your subscription GUID to azure-psql-app/infra/.azure-subscription (first line)."; \
		exit 1; \
	else \
		sub_id=$$(head -n 1 azure-psql-app/infra/.azure-subscription | tr -d '\r\n'); \
		if [ -z "$$sub_id" ]; then \
			echo "Subscription GUID is empty. Please add your subscription ID to azure-psql-app/infra/.azure-subscription."; \
			exit 1; \
		fi; \
		echo "Setting Azure subscription context to $$sub_id..."; \
		az account set --subscription $$sub_id; \
	fi

terraform-install:
	@echo "Installing Terraform CLI via Homebrew (macOS)"
	@echo "Run: brew install terraform"
	@echo "Or see https://developer.hashicorp.com/terraform/downloads for other platforms"

# --- Full Automation ---
full-launch: az-authenticate ensure-subscription authenticate install docker-build infra-init infra-apply test ui
