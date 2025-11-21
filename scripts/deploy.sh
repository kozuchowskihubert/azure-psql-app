#!/bin/bash
# Unified Deployment Script for Azure PostgreSQL App
# Handles infrastructure deployment, Docker image build/push, and verification

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INFRA_DIR="$PROJECT_ROOT/infra"
ACR_NAME="notesappdevacr"
ACR_LOGIN_SERVER="notesappdevacr.azurecr.io"
IMAGE_NAME="notesapp"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Functions
print_header() {
    echo ""
    echo "=================================================="
    echo "$1"
    echo "=================================================="
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_tools=()
    
    # Check required tools
    command -v az >/dev/null 2>&1 || missing_tools+=("azure-cli")
    command -v terraform >/dev/null 2>&1 || missing_tools+=("terraform")
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo ""
        echo "Please install missing tools:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running!"
        echo ""
        echo "Please start Docker Desktop:"
        echo "  open -a Docker"
        exit 1
    fi
    
    # Check Azure login
    if ! az account show > /dev/null 2>&1; then
        print_error "Not logged in to Azure"
        echo ""
        echo "Please login:"
        echo "  az login"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

authenticate_acr() {
    print_header "Authenticating with Azure Container Registry"
    
    # Method 1: Try Azure CLI login (easiest)
    echo "Attempting Azure CLI authentication..."
    if az acr login --name $ACR_NAME 2>/dev/null; then
        print_success "Authenticated with ACR using Azure CLI"
        return 0
    fi
    
    print_warning "Azure CLI authentication failed, trying admin credentials..."
    
    # Method 2: Use admin credentials
    local credentials=$(az acr credential show --name $ACR_NAME --output json)
    local username=$(echo $credentials | jq -r '.username')
    local password=$(echo $credentials | jq -r '.passwords[0].value')
    
    if [ -z "$username" ] || [ -z "$password" ]; then
        print_error "Failed to get ACR credentials"
        return 1
    fi
    
    echo "$password" | docker login $ACR_LOGIN_SERVER -u $username --password-stdin
    
    if [ $? -eq 0 ]; then
        print_success "Authenticated with ACR using admin credentials"
        return 0
    else
        print_error "Failed to authenticate with ACR"
        return 1
    fi
}

deploy_infrastructure() {
    print_header "Deploying Infrastructure"
    
    cd "$INFRA_DIR"
    
    if [ ! -f "terraform.tfvars" ]; then
        print_error "terraform.tfvars not found in $INFRA_DIR"
        echo ""
        echo "Please create terraform.tfvars with required variables"
        exit 1
    fi
    
    echo "Initializing Terraform..."
    terraform init -upgrade
    
    echo "Planning infrastructure changes..."
    terraform plan -var-file=terraform.tfvars -out=tfplan
    
    echo ""
    read -p "Apply these changes? (yes/no): " -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_warning "Infrastructure deployment cancelled"
        return 1
    fi
    
    terraform apply tfplan
    
    if [ $? -eq 0 ]; then
        print_success "Infrastructure deployed successfully"
        echo ""
        terraform output
        return 0
    else
        print_error "Infrastructure deployment failed"
        return 1
    fi
}

build_and_push_image() {
    print_header "Building and Pushing Docker Image"
    
    cd "$PROJECT_ROOT"
    
    local full_image_name="$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG"
    
    echo "Building Docker image: $full_image_name"
    docker build -t "$full_image_name" .
    
    if [ $? -ne 0 ]; then
        print_error "Docker build failed"
        return 1
    fi
    
    print_success "Docker image built successfully"
    
    echo ""
    echo "Pushing image to ACR..."
    docker push "$full_image_name"
    
    if [ $? -eq 0 ]; then
        print_success "Image pushed to ACR successfully"
        echo ""
        echo "Image: $full_image_name"
        return 0
    else
        print_error "Failed to push image to ACR"
        return 1
    fi
}

verify_deployment() {
    print_header "Verifying Deployment"
    
    cd "$INFRA_DIR"
    
    # Get app URL from Terraform output
    local app_url=$(terraform output -raw app_url 2>/dev/null || echo "")
    
    if [ -z "$app_url" ]; then
        print_warning "Could not get app URL from Terraform output"
        return 0
    fi
    
    echo "Application URL: $app_url"
    echo ""
    echo "Testing health endpoint..."
    
    # Wait a bit for app to start
    sleep 5
    
    if curl -f -s "$app_url/health" > /dev/null; then
        print_success "Application is healthy and responding"
        echo ""
        echo "You can access your application at:"
        echo "  $app_url"
    else
        print_warning "Application is not responding yet (this is normal for first deployment)"
        echo ""
        echo "The application may take a few minutes to start. Check:"
        echo "  $app_url"
    fi
}

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Unified deployment script for Azure PostgreSQL App

OPTIONS:
    all                 Run complete deployment (infrastructure + image)
    infra               Deploy only infrastructure
    image               Build and push Docker image only
    verify              Verify deployment
    help                Show this help message

EXAMPLES:
    $0 all              # Full deployment
    $0 infra            # Deploy infrastructure only
    $0 image            # Build and push image only

ENVIRONMENT VARIABLES:
    IMAGE_TAG           Docker image tag (default: latest)

EOF
}

# Main execution
main() {
    local command="${1:-all}"
    
    case "$command" in
        all)
            print_header "Azure PostgreSQL App - Full Deployment"
            check_prerequisites
            authenticate_acr
            deploy_infrastructure
            build_and_push_image
            verify_deployment
            print_header "Deployment Complete"
            print_success "All steps completed successfully!"
            ;;
        infra)
            print_header "Azure PostgreSQL App - Infrastructure Deployment"
            check_prerequisites
            deploy_infrastructure
            print_success "Infrastructure deployment complete!"
            ;;
        image)
            print_header "Azure PostgreSQL App - Image Build & Push"
            check_prerequisites
            authenticate_acr
            build_and_push_image
            print_success "Image build and push complete!"
            ;;
        verify)
            print_header "Azure PostgreSQL App - Deployment Verification"
            check_prerequisites
            verify_deployment
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
