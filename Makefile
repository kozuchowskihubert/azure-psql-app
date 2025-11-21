# Azure PostgreSQL Application - Makefile
# Project: azure-psql-app
# Description: Core application and music production utilities

.PHONY: help install test lint clean dev build deploy docker infra music

# Default target
.DEFAULT_GOAL := help

##@ General

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

setup-env: ## Copy environment template to .env
	@echo "⚙️  Setting up environment..."
	@if [ ! -f .env ]; then \
		cp config/.env.template .env; \
		echo "✅ Created .env file - please configure it"; \
		echo "📝 Edit .env with your database and secret values"; \
	else \
		echo "⚠️  .env already exists, skipping..."; \
	fi

setup-act: ## Setup Act for local GitHub Actions testing
	@echo "🎭 Setting up Act configuration..."
	@if [ ! -f .secrets ]; then \
		cp config/.secrets.example .secrets; \
		echo "✅ Created .secrets file - please configure it"; \
		echo "📝 Edit .secrets with your actual secret values"; \
	else \
		echo "⚠️  .secrets already exists, skipping..."; \
	fi

##@ Core Application

install: ## Install core application dependencies
	@echo "📦 Installing core dependencies..."
	cd app && npm ci
	@echo "✅ Dependencies installed"

test: ## Run all tests
	@echo "🧪 Running tests..."
	cd app && npm test
	@echo "✅ Tests completed"

test-smoke: ## Run smoke tests only
	@echo "🧪 Running smoke tests..."
	cd app && npm run test:ci
	@echo "✅ Smoke tests completed"

lint: ## Run ESLint on core application
	@echo "🔍 Linting code..."
	cd app && npm run lint
	@echo "✅ Linting completed"

lint-fix: ## Auto-fix ESLint issues
	@echo "🔧 Auto-fixing lint issues..."
	cd app && npm run lint:fix
	@echo "✅ Lint fixes applied"

dev: ## Start development server
	@echo "🚀 Starting development server..."
	cd app && npm run dev

start: ## Start production server
	@echo "🚀 Starting production server..."
	cd app && npm start

clean: ## Clean generated files and dependencies
	@echo "🧹 Cleaning..."
	rm -rf app/node_modules
	rm -rf app/coverage
	rm -rf app/.nyc_output
	find . -name "*.log" -delete
	@echo "✅ Cleanup completed"

##@ Database

db-migrate: ## Run database migrations
	@echo "🗄️  Running database migrations..."
	cd app && npm run migrate
	@echo "✅ Migrations completed"

db-init: ## Initialize database schema
	@echo "🗄️  Initializing database..."
	cd app && node utils/db-init.js
	@echo "✅ Database initialized"

##@ Docker & Build

build: ## Build production application
	@echo "🏗️  Building application..."
	cd app && npm ci --production
	@echo "✅ Build completed"

docker-build: ## Build Docker image for main app
	@echo "🐳 Building Docker image..."
	docker build -t azure-psql-app:latest -f Dockerfile .
	@echo "✅ Docker image built"

docker-build-music: ## Build Docker image for music app
	@echo "🐳 Building music Docker image..."
	docker build -t azure-psql-app-music:latest -f Dockerfile.music .
	@echo "✅ Music Docker image built"

docker-run: ## Run Docker container locally
	@echo "🐳 Running Docker container..."
	docker run -p 3000:3000 --env-file .env azure-psql-app:latest

docker-clean: ## Remove Docker images and containers
	@echo "🧹 Cleaning Docker resources..."
	docker rmi azure-psql-app:latest || true
	docker rmi azure-psql-app-music:latest || true
	@echo "✅ Docker cleanup completed"

##@ Infrastructure

infra-init: ## Initialize Terraform backend
	@echo "🏗️  Initializing Terraform..."
	cd infra && terraform init
	@echo "✅ Terraform initialized"

infra-plan: ## Plan infrastructure changes
	@echo "📋 Planning infrastructure..."
	cd infra && terraform plan
	@echo "✅ Plan completed"

infra-apply: ## Apply infrastructure changes
	@echo "🚀 Applying infrastructure..."
	cd infra && terraform apply
	@echo "✅ Infrastructure deployed"

infra-destroy: ## Destroy infrastructure
	@echo "💥 Destroying infrastructure..."
	cd infra && terraform destroy
	@echo "✅ Infrastructure destroyed"

infra-bootstrap: ## Bootstrap Terraform backend
	@echo "🔧 Bootstrapping Terraform backend..."
	cd infra && bash bootstrap-backend.sh
	@echo "✅ Backend bootstrapped"

##@ Music Production (Side Functions)

music-install: ## Install music production dependencies
	@echo "🎵 Installing music dependencies..."
	cd app/ableton-cli && pip3 install -r requirements.txt
	@echo "✅ Music dependencies installed"

music-demo: ## Run MIDI demo
	@echo "🎹 Running MIDI demo..."
	python3 scripts/music/test-midi-preview.py
	@echo "✅ Demo completed"

music-generate-midi: ## Generate MIDI files
	@echo "🎼 Generating MIDI files..."
	cd app/ableton-cli && python3 create_deep_techno_midi.py
	@echo "✅ MIDI files generated"

music-generate-template: ## Generate Ableton template
	@echo "🎛️  Generating Ableton template..."
	cd app/ableton-cli && python3 generate_deep_techno_template.py
	@echo "✅ Template generated"

music-synth2600: ## Launch Synth 2600 CLI
	@echo "🎛️  Launching Behringer 2600 CLI..."
	cd app/ableton-cli && python synth2600_cli.py
	@echo "✅ Synth 2600 CLI completed"

music-clean: ## Clean music output files
	@echo "🧹 Cleaning music outputs..."
	rm -rf app/ableton-cli/output/*.mid
	rm -rf app/ableton-cli/output/*.als
	@echo "✅ Music outputs cleaned"

##@ Deployment

deploy-dev: ## Deploy to development environment
	@echo "🚀 Deploying to development..."
	bash scripts/deploy.sh
	@echo "✅ Deployed to development"

deploy-pwa: ## Deploy PWA updates
	@echo "📱 Deploying PWA..."
	bash scripts/deploy-pwa.sh
	@echo "✅ PWA deployed"

deploy-local: ## Run local deployment test
	@echo "🧪 Testing local deployment..."
	bash scripts/run-local.sh
	@echo "✅ Local deployment test completed"

##@ Testing & CI/CD

test-cicd: ## Test CI/CD locally with Act
	@echo "🎭 Testing CI/CD with Act..."
	bash scripts/testing/test-cicd-local.sh
	@echo "✅ CI/CD test completed"

act-run: ## Run GitHub Actions locally
	@echo "🎭 Running GitHub Actions locally..."
	bash scripts/run-act.sh
	@echo "✅ Act run completed"

##@ Documentation

docs-serve: ## Serve documentation locally
	@echo "📚 Serving documentation..."
	@echo "Documentation available at:"
	@echo "  - Main: docs/README.md"
	@echo "  - Architecture: docs/ARCHITECTURE.md"
	@echo "  - Build: docs/build-deployment/BUILD_SUMMARY.md"
	@echo "  - Music: docs/ableton-cli/INDEX.md"

docs-structure: ## Show directory structure
	@cat DIRECTORY_STRUCTURE.md

##@ Utilities

verify-sso: ## Verify SSO configuration
	@echo "🔐 Verifying SSO..."
	bash scripts/verify-sso.sh
	@echo "✅ SSO verified"

unlock-terraform: ## Unlock Terraform state
	@echo "🔓 Unlocking Terraform state..."
	bash scripts/unlock-terraform.sh
	@echo "✅ Terraform unlocked"

delete-failed-runs: ## Delete failed GitHub Actions runs
	@echo "🗑️  Deleting failed runs..."
	bash scripts/delete-failed-runs.sh
	@echo "✅ Failed runs deleted"

##@ Full Workflows

setup: install music-install ## Complete setup (core + music)
	@echo "✅ Full setup completed"

test-all: test test-smoke lint ## Run all tests and linting
	@echo "✅ All tests completed"

build-all: build docker-build docker-build-music ## Build everything
	@echo "✅ All builds completed"

clean-all: clean music-clean docker-clean ## Clean everything
	@echo "✅ Full cleanup completed"

deploy-all: deploy-dev deploy-pwa ## Deploy all components
	@echo "✅ Full deployment completed"
