#!/bin/bash
# Act Helper Script
# Makes it easier to run GitHub Actions locally with act

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=================================================="
    echo -e "$1"
    echo -e "==================================================${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if act is installed
if ! command -v act &> /dev/null; then
    print_error "act is not installed"
    echo ""
    echo "Install with:"
    echo "  brew install act"
    exit 1
fi

# Check if .secrets file exists
if [ ! -f ".secrets" ]; then
    print_error ".secrets file not found"
    echo ""
    echo "Create .secrets file with your GitHub secrets:"
    echo "  1. Copy .secrets.example to .secrets"
    echo "  2. Fill in your actual values"
    echo ""
    echo "  cp .secrets.example .secrets"
    echo "  nano .secrets"
    exit 1
fi

show_usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Run GitHub Actions workflows locally using act

COMMANDS:
    list                List all workflows and jobs
    validate            Run validation job only
    build               Run build-and-push job only
    infra               Run deploy-infrastructure job only
    all                 Run entire CI/CD workflow
    pull-request        Simulate a pull request
    push                Simulate a push event (default)
    help                Show this help

ACT OPTIONS (passed through):
    -n, --dry-run       Don't actually run, just show what would run
    -v, --verbose       Verbose output
    -j JOB              Run specific job
    --reuse             Reuse containers (faster)
    --rm                Remove containers after run

EXAMPLES:
    # List all available workflows
    $0 list

    # Run validation job only (fast)
    $0 validate

    # Dry run to see what would execute
    $0 all --dry-run

    # Run specific job with verbose output
    $0 build -v

    # Simulate pull request event
    $0 pull-request

EOF
}

case "${1:-push}" in
    list)
        print_header "Available Workflows and Jobs"
        act -l
        ;;
    
    validate)
        print_header "Running Validation Job"
        print_info "This will run code validation, linting, and Terraform checks"
        act push -j validate "${@:2}"
        ;;
    
    build)
        print_header "Running Build & Push Job"
        print_info "This will build and push Docker image to ACR"
        act push -j build-and-push "${@:2}"
        ;;
    
    infra)
        print_header "Running Infrastructure Deployment"
        print_info "This will deploy infrastructure with Terraform"
        act push -j deploy-infrastructure "${@:2}"
        ;;
    
    all)
        print_header "Running Complete CI/CD Pipeline"
        print_info "This will run all jobs in sequence"
        echo ""
        print_info "Note: This may take 15-30 minutes"
        echo ""
        act push "${@:2}"
        ;;
    
    pull-request)
        print_header "Simulating Pull Request"
        print_info "This will run validation without deployment"
        act pull_request "${@:2}"
        ;;
    
    push)
        print_header "Simulating Push Event"
        print_info "This will run the full CI/CD pipeline"
        act push "${@:2}"
        ;;
    
    help|--help|-h)
        show_usage
        ;;
    
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
