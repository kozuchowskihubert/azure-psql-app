# Azure PostgreSQL Application - CI/CD Status

This file tracks CI/CD pipeline status and deployment history.

## Latest Deployment

**Date:** 2025-11-08  
**Status:** ⏳ Pending  
**Trigger:** Manual workflow trigger  
**Pipeline:** Modernized CI/CD with 6-stage workflow  

## Pipeline Stages

1. ✅ **Validate** - Code linting, tests, Terraform validation
2. ⏳ **Build & Push** - Docker image build and push to ACR
3. ⏳ **Deploy Infrastructure** - Terraform apply
4. ⏳ **Deploy Application** - Azure Web App deployment
5. ⏳ **Verify Deployment** - Health checks and API testing
6. ⏳ **Notify Status** - Final status notification

## Image Registry

- **ACR:** notesappdevacr.azurecr.io
- **Image:** notesapp
- **Tags:** latest, main-{sha}

## Quick Links

- [CI/CD Pipeline](https://github.com/kozuchowskihubert/azure-psql-app/actions)
- [Setup Guide](../.github/SECRETS_SETUP.md)
- [CI/CD Improvements](../.github/CI_CD_IMPROVEMENTS.md)

## Next Steps

1. Configure GitHub Secrets (see `.github/SECRETS_SETUP.md`)
2. Monitor pipeline execution
3. Verify deployment health

---
*This file is updated automatically by the CI/CD pipeline*
