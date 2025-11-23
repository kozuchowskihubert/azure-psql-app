# 🧪 Act - Local GitHub Actions Testing Guide

Test GitHub Actions workflows locally before pushing to GitHub.

## ✅ Setup Complete

- ✅ Act installed (`/opt/homebrew/bin/act`)
- ✅ Docker running
- ✅ `.actrc` configured
- ✅ `.secrets` file exists

## 🚀 Quick Commands

### Test Validation Job (Recommended)
```bash
act -j validate -W .github/workflows/deploy-music-app.yml push
```

### Dry Run (See What Would Execute)
```bash
act -n -W .github/workflows/deploy-music-app.yml push
```

### List All Jobs
```bash
act -l -W .github/workflows/deploy-music-app.yml
```

### Test Specific Job
```bash
# Validate only
act -j validate -W .github/workflows/deploy-music-app.yml push

# Build Docker image
act -j build-and-push -W .github/workflows/deploy-music-app.yml push

# Deploy infrastructure
act -j deploy-infrastructure -W .github/workflows/deploy-music-app.yml push
```

### For M1/M2 Macs
```bash
act -j validate --container-architecture linux/amd64 -W .github/workflows/deploy-music-app.yml push
```

## 📋 Available Jobs

| Stage | Job | Description |
|-------|-----|-------------|
| 0 | `validate` | Validate code, Docker, dependencies |
| 1 | `deploy-infrastructure` | Provision Azure infrastructure |
| 2 | `build-and-push` | Build Docker image, push to ACR |
| 3 | `deploy-application` | Deploy to Azure App Service |
| 4 | `verify-deployment` | Run health checks |
| 5 | `notify` | Send deployment notifications |

## 🐛 Troubleshooting

### Docker Credential Error
If you see `docker-credential-desktop: executable file not found`:

```bash
# Option 1: Remove credential helper from Docker config
rm ~/.docker/config.json

# Option 2: Or edit ~/.docker/config.json and remove:
# "credsStore": "desktop"
```

### Architecture Issues (M1/M2)
```bash
# Always add --container-architecture flag
act --container-architecture linux/amd64 [other-options]
```

### Secrets Not Loading
```bash
# Verify secrets file exists
ls -la .secrets

# Test with explicit secrets file
act --secret-file .secrets -j validate -W .github/workflows/deploy-music-app.yml push
```

## 📚 Act Configuration

Configuration in `.actrc`:
- Uses `catthehacker/ubuntu:act-latest` image
- Loads secrets from `.secrets`
- Sets environment variables
- Enables verbose logging

## 🎯 Best Practices

1. **Test validation first** - Fastest feedback loop
2. **Use dry run** - See execution plan without running
3. **Test locally before push** - Catch errors early
4. **M1/M2 users** - Always use `--container-architecture linux/amd64`

## 🔗 Resources

- [Act GitHub](https://github.com/nektos/act)
- [Act Documentation](https://nektosact.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

**Last Updated**: November 22, 2025
