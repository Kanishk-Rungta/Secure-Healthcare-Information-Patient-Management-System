# GitHub Actions Quick Setup - 5 Minutes

## What You Need

4 secrets from Vercel to add to GitHub.

## Get Your Vercel IDs

### 1. VERCEL_TOKEN

1. Go to: https://vercel.com/settings/tokens
2. Click **Create** → Create new token
3. Copy the token

### 2. VERCEL_ORG_ID

1. Go to: https://vercel.com/settings/general
2. Copy **Team ID** (your org ID)

### 3. VERCEL_BACKEND_PROJECT_ID

1. Go to: Vercel Dashboard → Backend Project
2. Click **Settings** → **General**
3. Copy **Project ID**

### 4. VERCEL_FRONTEND_PROJECT_ID

1. Go to: Vercel Dashboard → Frontend Project
2. Click **Settings** → **General**
3. Copy **Project ID**

---

## Add Secrets to GitHub

1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:

```
Name: VERCEL_TOKEN
Value: [paste from step 1]

Name: VERCEL_ORG_ID
Value: [paste from step 2]

Name: VERCEL_BACKEND_PROJECT_ID
Value: [paste from step 3]

Name: VERCEL_FRONTEND_PROJECT_ID
Value: [paste from step 4]
```

---

## Push Code to Trigger

```bash
git add .
git commit -m "Add GitHub Actions CI/CD"
git push origin main
```

---

## Verify It Works

1. Go to GitHub repo → **Actions** tab
2. See workflows running:
   - Backend CI
   - Frontend CI
   - Deploy to Vercel

3. Wait for all to show ✅ green checkmarks

---

## What Happens Now

**Every time you push:**

1. ✅ Backend tests run
2. ✅ Frontend tests run
3. ✅ Both deploy to Vercel (if on main)

**Every time you create a PR:**

1. ✅ Tests run automatically
2. ✅ Results show on PR
3. ✅ Can't merge if tests fail

---

## Done! 🎉

Your CI/CD pipeline is live. Check Actions tab to see it working.
