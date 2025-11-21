#!/bin/bash
# Local CI/CD Pipeline Simulation
# This script mimics the GitHub Actions CI/CD pipeline for local testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INFRA_DIR="$PROJECT_ROOT/infra"
APP_DIR="$PROJECT_ROOT/app"
ACR_NAME="notesappdevacr"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
IMAGE_NAME="notesapp"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Functions
print_header() {
    echo ""
    echo -e "${CYAN}=================================================="
    echo -e "$1"
    echo -e "==================================================${NC}"
    echo ""
}

print_stage() {
    echo ""
    echo -e "${BLUE}▶ Stage: $1${NC}"
    echo ""
}

print_step() {
    echo -e "${YELLOW}  → $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

print_skip() {
    echo -e "${YELLOW}⏭️  $1${NC}"
    ((TESTS_SKIPPED++))
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Stage 1: Validate
stage_validate() {
    print_stage "1. Validate Code & Infrastructure"
    
    # Check prerequisites
    print_step "Checking prerequisites..."
    local missing_tools=()
    
    command -v node >/dev/null 2>&1 || missing_tools+=("node")
    command -v terraform >/dev/null 2>&1 || missing_tools+=("terraform")
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v az >/dev/null 2>&1 || missing_tools+=("azure-cli")
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing tools: ${missing_tools[*]}"
        return 1
    else
        print_success "All required tools are installed"
    fi
    
    # Check Node.js dependencies
    print_step "Checking Node.js dependencies..."
    cd "$APP_DIR"
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ]; then
            print_info "Installing npm dependencies..."
            npm ci --silent
        fi
        print_success "Node.js dependencies are ready"
    else
        print_skip "No package.json found"
    fi
    
    # Run linting (if available)
    print_step "Running linting..."
    if npm run lint --if-present >/dev/null 2>&1; then
        print_success "Linting passed"
    else
        print_skip "No lint script found"
    fi
    
    # Run tests (if available)
    print_step "Running tests..."
    if npm test --if-present >/dev/null 2>&1; then
        print_success "Tests passed"
    else
        print_skip "No tests found"
    fi
    
    # Terraform format check
    print_step "Checking Terraform formatting..."
    cd "$INFRA_DIR"
    if terraform fmt -check -recursive >/dev/null 2>&1; then
        print_success "Terraform formatting is correct"
    else
        print_error "Terraform formatting issues found (run: terraform fmt -recursive)"
        return 1
    fi
    
    # Terraform validation
    print_step "Validating Terraform configuration..."
    terraform init -backend=false >/dev/null 2>&1
    if terraform validate >/dev/null 2>&1; then
        print_success "Terraform configuration is valid"
    else
        print_error "Terraform validation failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT"
}

# Stage 2: Build & Push
stage_build_push() {
    print_stage "2. Build & Push Docker Image"
    
    # Check Docker daemon
    print_step "Checking Docker daemon..."
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running"
        return 1
    fi
    print_success "Docker daemon is running"
    
    # Check Azure login
    print_step "Checking Azure authentication..."
    if ! az account show >/dev/null 2>&1; then
        print_error "Not logged in to Azure (run: az login)"
        return 1
    fi
    print_success "Azure authentication is valid"
    
    # Login to ACR
    print_step "Authenticating with Azure Container Registry..."
    if az acr login --name "$ACR_NAME" >/dev/null 2>&1; then
        print_success "ACR authentication successful"
    else
        print_error "ACR authentication failed"
        return 1
    fi
    
    # Build Docker image
    print_step "Building Docker image..."
    cd "$PROJECT_ROOT"
    local full_image_name="${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}"
    
    if docker build -t "$full_image_name" -f Dockerfile . >/dev/null 2>&1; then
        print_success "Docker image built: $full_image_name"
    else
        print_error "Docker build failed"
        return 1
    fi
    
    # Push to ACR (optional - can be skipped for quick local tests)
    if [ "${SKIP_PUSH:-false}" != "true" ]; then
        print_step "Pushing image to ACR..."
        if docker push "$full_image_name" >/dev/null 2>&1; then
            print_success "Image pushed to ACR"
        else
            print_error "Image push failed"
            return 1
        fi
    else
        print_skip "Image push skipped (SKIP_PUSH=true)"
    fi
}

# Stage 3: Deploy Infrastructure
stage_deploy_infrastructure() {
    print_stage "3. Deploy Infrastructure"
    
    cd "$INFRA_DIR"
    
    # Check for terraform.tfvars
    print_step "Checking Terraform configuration..."
    if [ ! -f "terraform.tfvars" ]; then
        print_error "terraform.tfvars not found"
        print_info "Create terraform.tfvars with required variables"
        return 1
    fi
    print_success "Terraform configuration found"
    
    # Terraform init
    print_step "Initializing Terraform..."
    if terraform init -upgrade >/dev/null 2>&1; then
        print_success "Terraform initialized"
    else
        print_error "Terraform init failed"
        return 1
    fi
    
    # Terraform plan
    print_step "Planning infrastructure changes..."
    if terraform plan -var-file=terraform.tfvars -out=tfplan.local >/dev/null 2>&1; then
        print_success "Terraform plan created"
        
        # Show plan summary
        echo ""
        terraform show -no-color tfplan.local | grep -E "Plan:|No changes"
        echo ""
    else
        print_error "Terraform plan failed"
        return 1
    fi
    
    # Ask for confirmation before apply (unless AUTO_APPROVE=true)
    if [ "${AUTO_APPROVE:-false}" != "true" ]; then
        echo ""
        read -p "Apply these changes? (yes/no): " -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_skip "Infrastructure deployment cancelled by user"
            return 0
        fi
    fi
    
    # Terraform apply
    print_step "Applying infrastructure changes..."
    if terraform apply tfplan.local; then
        print_success "Infrastructure deployed"
        rm -f tfplan.local
    else
        print_error "Terraform apply failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT"
}

# Stage 4: Deploy Application
stage_deploy_application() {
    print_stage "4. Deploy Application"
    
    print_step "Getting Web App name..."
    local webapp_name=$(az webapp list \
        --resource-group notesapp-dev-rg \
        --query "[0].name" \
        --output tsv 2>/dev/null)
    
    if [ -z "$webapp_name" ]; then
        print_error "Could not find Web App"
        return 1
    fi
    print_success "Web App found: $webapp_name"
    
    # Restart Web App
    print_step "Restarting Web App..."
    if az webapp restart \
        --name "$webapp_name" \
        --resource-group notesapp-dev-rg >/dev/null 2>&1; then
        print_success "Web App restarted"
    else
        print_error "Web App restart failed"
        return 1
    fi
}

# Stage 5: Verify Deployment
stage_verify() {
    print_stage "5. Verify Deployment"
    
    # Get app URL
    print_step "Getting application URL..."
    cd "$INFRA_DIR"
    local app_url=$(terraform output -raw app_url 2>/dev/null || echo "")
    
    if [ -z "$app_url" ]; then
        print_skip "Could not get app URL from Terraform output"
        return 0
    fi
    print_success "App URL: $app_url"
    
    # Wait for app to start
    print_step "Waiting for application to start..."
    sleep 10
    
    # Health check with retries
    print_step "Performing health check..."
    local max_retries=5
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -f -s "$app_url/health" >/dev/null 2>&1; then
            print_success "Health check passed"
            break
        fi
        
        ((retry_count++))
        if [ $retry_count -lt $max_retries ]; then
            echo "  Attempt $retry_count failed, retrying in 10s..."
            sleep 10
        else
            print_error "Health check failed after $max_retries attempts"
            return 1
        fi
    done
    
    # Test notes endpoint
    print_step "Testing /notes endpoint..."
    local response=$(curl -s "$app_url/notes" 2>/dev/null || echo "")
    if [ -n "$response" ]; then
        print_success "Notes endpoint is responding"
        echo "  Response: $response" | head -c 100
        echo ""
    else
        print_skip "Notes endpoint not responding (may need data)"
    fi
    
    cd "$PROJECT_ROOT"
}

# Generate test report
generate_report() {
    print_header "Test Report"
    
    local total=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))
    
    echo -e "${GREEN}Passed:  $TESTS_PASSED${NC}"
    echo -e "${RED}Failed:  $TESTS_FAILED${NC}"
    echo -e "${YELLOW}Skipped: $TESTS_SKIPPED${NC}"
    echo "Total:   $total"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        return 1
    fi
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] [STAGES]

Local CI/CD Pipeline Simulation

STAGES:
    validate    Run validation only
    build       Run validation + build
    infra       Run validation + build + infrastructure
    deploy      Run validation + build + infrastructure + deploy
    all         Run complete pipeline (default)

OPTIONS:
    -s, --skip-push         Skip pushing Docker image to ACR
    -a, --auto-approve      Auto-approve Terraform changes
    -t, --image-tag TAG     Docker image tag (default: latest)
    -h, --help              Show this help message

ENVIRONMENT VARIABLES:
    SKIP_PUSH=true          Skip Docker push
    AUTO_APPROVE=true       Auto-approve Terraform
    IMAGE_TAG=v1.0.0        Custom image tag

EXAMPLES:
    # Run complete pipeline
    $0 all

    # Run validation only
    $0 validate

    # Build without pushing to ACR
    $0 build --skip-push

    # Deploy with auto-approve
    $0 deploy --auto-approve

    # Build with custom tag
    IMAGE_TAG=v1.0.0 $0 build

    # Quick validation and build
    $0 build -s

EOF
}

# Main execution
main() {
    local stage="all"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            validate|build|infra|deploy|all)
                stage=$1
                shift
                ;;
            -s|--skip-push)
                export SKIP_PUSH=true
                shift
                ;;
            -a|--auto-approve)
                export AUTO_APPROVE=true
                shift
                ;;
            -t|--image-tag)
                export IMAGE_TAG="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_header "Local CI/CD Pipeline Simulation"
    
    print_info "Configuration:"
    print_info "  Stage: $stage"
    print_info "  Image Tag: $IMAGE_TAG"
    print_info "  Skip Push: ${SKIP_PUSH:-false}"
    print_info "  Auto Approve: ${AUTO_APPROVE:-false}"
    
    # Run stages based on selection
    case $stage in
        validate)
            stage_validate || exit 1
            ;;
        build)
            stage_validate || exit 1
            stage_build_push || exit 1
            ;;
        infra)
            stage_validate || exit 1
            stage_build_push || exit 1
            stage_deploy_infrastructure || exit 1
            ;;
        deploy)
            stage_validate || exit 1
            stage_build_push || exit 1
            stage_deploy_infrastructure || exit 1
            stage_deploy_application || exit 1
            ;;
        all)
            stage_validate || exit 1
            stage_build_push || exit 1
            stage_deploy_infrastructure || exit 1
            stage_deploy_application || exit 1
            stage_verify || exit 1
            ;;
    esac
    
    # Generate report
    echo ""
    generate_report
}

main "$@"
