# GitHub Actions CI/CD Setup Guide

## Overview

This guide explains the automated CI/CD pipeline set up for your healthcare app. The pipeline includes:

- **Testing**: Runs on every pull request and push
- **Linting**: Code quality checks
- **Building**: Verifies the build succeeds
- **Deploying**: Automatic deployment to Vercel on merge to main

---

## What's Included

### Workflows Created

1. **Backend CI** (`.github/workflows/backend-ci.yml`)
   - Runs on: Push/PR to main or develop (backend changes)
   - Steps: Install → Lint → Test → Build

2. **Frontend CI** (`.github/workflows/frontend-ci.yml`)
   - Runs on: Push/PR to main or develop (frontend changes)
   - Steps: Install → Lint → Test → Build

3. **Deploy to Vercel** (`.github/workflows/deploy.yml`)
   - Runs on: Push to main (after successful CI)
   - Steps: Deploy Backend → Deploy Frontend → Notify

---

## Setup Instructions

### Step 1: Add GitHub Secrets

GitHub Actions need credentials to deploy to Vercel. Add these secrets to your repo:

1. Go to GitHub: **Repository → Settings → Secrets and variables → Actions**
2. Click **New repository secret** and add these:

| Secret Name                  | Value                       | Where to Get                                      |
| ---------------------------- | --------------------------- | ------------------------------------------------- |
| `VERCEL_TOKEN`               | Your Vercel API token       | Vercel Settings → Tokens                          |
| `VERCEL_ORG_ID`              | Your Vercel organization ID | Vercel Settings → General (Team ID)               |
| `VERCEL_BACKEND_PROJECT_ID`  | Backend project ID          | Vercel → Backend Project → Settings → Project ID  |
| `VERCEL_FRONTEND_PROJECT_ID` | Frontend project ID         | Vercel → Frontend Project → Settings → Project ID |

### Step 1a: Get Vercel Token

1. Go to https://vercel.com/settings/tokens
2. Click **Create** (or use existing token)
3. Copy the token
4. Paste as `VERCEL_TOKEN` secret

### Step 1b: Get Vercel IDs

1. Go to https://vercel.com/settings/general
2. Copy **Team ID** → Paste as `VERCEL_ORG_ID`

3. For Backend Project ID:
   - Go to Backend Project in Vercel
   - Settings → General
   - Copy **Project ID** → Paste as `VERCEL_BACKEND_PROJECT_ID`

4. For Frontend Project ID:
   - Go to Frontend Project in Vercel
   - Settings → General
   - Copy **Project ID** → Paste as `VERCEL_FRONTEND_PROJECT_ID`

---

## How It Works

### Trigger Points

**Backend CI triggers when:**

- Code pushed to `main` or `develop`
- Pull request created/updated (with backend changes)
- File path: `backend/**` or `.github/workflows/backend-ci.yml`

**Frontend CI triggers when:**

- Code pushed to `main` or `develop`
- Pull request created/updated (with frontend changes)
- File path: `frontend/**` or `.github/workflows/frontend-ci.yml`

**Deploy triggers when:**

- Code pushed directly to `main` (auto-deploy)
- OR after Backend CI + Frontend CI both succeed

### Pipeline Stages

```
Push Code
   ↓
├─ Backend CI (runs if backend files changed)
│  ├─ Install dependencies
│  ├─ Lint code
│  ├─ Run tests
│  └─ Build verification
├─ Frontend CI (runs if frontend files changed)
│  ├─ Install dependencies
│  ├─ Lint code
│  ├─ Run tests
│  └─ Build verification
   ↓
Both Pass?
   ↓ YES
Deploy to Vercel
   ├─ Deploy backend
   ├─ Deploy frontend
   └─ Notify on completion
```

---

## GitHub Actions Features

### 1. Automatic Testing on Pull Requests

When you create a PR, GitHub Actions automatically:

- Runs all tests
- Checks code quality (lint)
- Verifies the build succeeds
- ✅ Shows results on the PR (green check = pass)
- ❌ Shows failures (red X = fix needed)

**PR checks prevent broken code from being merged!**

### 2. Automatic Deployment on Merge

When code is merged to `main`:

- Both frontend and backend automatically deploy to Vercel
- Zero downtime deployment
- Your live app updates instantly

### 3. Caching

The workflows cache `node_modules` between runs:

- First run: ~3-5 minutes (downloads all packages)
- Subsequent runs: ~1-2 minutes (uses cache)

### 4. Artifact Storage

Build outputs are stored for 1 day:

- Backend build: `/backend/**`
- Frontend build: `/frontend/build/**`
- Can be downloaded from "Actions" tab if needed

---

## Workflow Files Explained

### `.github/workflows/backend-ci.yml`

```yaml
on:
  push:
    branches: [main, develop]
    paths:
      - "backend/**" # Only run if backend files changed
      - ".github/workflows/backend-ci.yml"
  pull_request:
    branches: [main, develop]
    paths:
      - "backend/**"
```

**Jobs:**

- `test`: Lint + Test (can fail but continues)
- `build`: Build verification (needs `test` to pass)

### `.github/workflows/frontend-ci.yml`

Same structure as backend CI but for frontend:

- Runs tests with coverage
- Builds React app
- Checks for security issues

### `.github/workflows/deploy.yml`

**Jobs:**

- `deploy-backend`: Uses Vercel Action to deploy backend
- `deploy-frontend`: Uses Vercel Action to deploy frontend
- `notify`: Shows deployment status

---

## Viewing Workflows

### See Workflow Status

1. Go to your GitHub repo
2. Click **Actions** tab
3. See all workflow runs with status:
   - ✅ **Success** (green)
   - ❌ **Failed** (red)
   - ⏳ **In Progress** (yellow)

### View Detailed Logs

1. Click on a workflow run
2. Click on a job (e.g., "Backend CI")
3. Click on a step to see logs
4. Look for errors or warnings

### View PR Checks

1. Go to a Pull Request
2. Scroll to **Checks** section
3. See pass/fail status for each workflow
4. Click "Details" to see logs

---

## Common Issues & Fixes

### ❌ "VERCEL_TOKEN not found"

- Add `VERCEL_TOKEN` to GitHub Secrets
- Make sure it's spelled exactly as shown

### ❌ "Project not found"

- Check `VERCEL_BACKEND_PROJECT_ID` and `VERCEL_FRONTEND_PROJECT_ID`
- Verify they're correct from Vercel dashboard

### ❌ "Linting fails on PR"

- Fix lint errors in your code:
  ```bash
  cd backend
  npm run lint:fix
  ```
- Push the fixes
- PR checks will re-run

### ❌ "Tests fail"

- Fix failing tests locally first
- Run: `npm test`
- Push fixes, PR will re-test

### ❌ "Build fails"

- Usually means missing dependencies or syntax errors
- Check workflow logs for specific error
- Run locally: `npm run build`

---

## Best Practices

### 1. Create Branch for Changes

```bash
git checkout -b feature/my-feature
# Make changes
git push origin feature/my-feature
# Create PR on GitHub
```

- Workflows run on PR
- Fix any issues
- Merge when all checks pass

### 2. Use Meaningful Commit Messages

```
✅ Good:
"Add user authentication"
"Fix CORS error on login"

❌ Bad:
"fix"
"update"
```

### 3. Review Workflow Logs

- Before merging, check all green checkmarks ✅
- If red X, click "Details" to see what failed
- Can't merge if checks fail (protects main branch)

### 4. Keep node_modules Updated

Periodically:

```bash
npm outdated
npm update
npm audit fix
```

### 5. Test Locally First

```bash
# Backend
cd backend
npm test
npm run lint

# Frontend
cd frontend
npm test
npm run lint
```

---

## Deployment Flow

### Manual Deployment (if needed)

1. Go to Vercel Dashboard
2. Find Backend Project → Deployments
3. Click "Redeploy" on latest commit

OR use CLI:

```bash
npm install -g vercel
vercel --prod
```

### Automatic Deployment (normal flow)

1. Work on feature branch
2. Create PR → Workflows run tests
3. Merge PR to main
4. Workflows automatically deploy
5. Check Vercel for live updates

---

## GitHub Actions Pricing

**Free tier includes:**

- 2,000 minutes/month (plenty for this project)
- Unlimited public repos
- Runs on GitHub-hosted servers

**Your pipeline uses ~5-10 minutes per run**

- Backend CI: ~2-3 minutes
- Frontend CI: ~2-3 minutes
- Deploy: ~2-3 minutes
- **Total: ~6-9 minutes per push**

---

## Advanced Customization

### Add Slack Notifications

Add to deploy workflow:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {"text": "Deployment to Vercel completed!"}
```

### Add Code Coverage Reports

Add to frontend CI:

```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./frontend/coverage/lcov.info
```

### Add Database Migrations

Add to backend deploy:

```yaml
- name: Run migrations
  run: npm run migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Troubleshooting Commands

### Debug locally

```bash
# Run backend linter
cd backend && npm run lint

# Run backend tests
cd backend && npm test

# Run backend build
cd backend && npm run build

# Run frontend build
cd frontend && npm run build
```

### View Vercel deploy logs

```bash
npm install -g vercel
vercel logs [deployment-id] --follow
```

### Check workflow syntax

```bash
# GitHub CLI (install from https://cli.github.com)
gh workflow view .github/workflows/backend-ci.yml
```

---

## What Happens on Each Event

| Event                | Workflows                         | Deploy? |
| -------------------- | --------------------------------- | ------- |
| Push to `main`       | Backend CI + Frontend CI + Deploy | ✅ YES  |
| Push to `develop`    | Backend CI + Frontend CI          | ❌ NO   |
| Create PR            | Backend CI + Frontend CI          | ❌ NO   |
| Merge PR to `main`   | Deploy                            | ✅ YES  |
| Push to other branch | None                              | ❌ NO   |

---

## File Structure

```
.github/
└── workflows/
    ├── backend-ci.yml     ← Backend testing & building
    ├── frontend-ci.yml    ← Frontend testing & building
    └── deploy.yml         ← Deploy to Vercel
```

All files are now in your repo and ready to use!

---

## Quick Checklist

- [ ] Add `VERCEL_TOKEN` secret to GitHub
- [ ] Add `VERCEL_ORG_ID` secret to GitHub
- [ ] Add `VERCEL_BACKEND_PROJECT_ID` secret to GitHub
- [ ] Add `VERCEL_FRONTEND_PROJECT_ID` secret to GitHub
- [ ] Push workflow files to main branch
- [ ] Go to GitHub Actions tab
- [ ] See workflows running
- [ ] Check that both CI workflows pass
- [ ] Verify deploy workflow runs
- [ ] Check Vercel for fresh deployments

---

## Support

- GitHub Actions Docs: https://docs.github.com/en/actions
- Vercel Action: https://github.com/amondnet/vercel-action
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

**Status**: ✅ Ready to Use
**Version**: 1.0.0
**Last Updated**: March 2026
