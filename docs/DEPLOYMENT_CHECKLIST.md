# Vercel Deployment Checklist - Complete Step-by-Step

## Phase 1: Prerequisites Setup (30 minutes)

### Create Accounts & Obtain Credentials

- [ ] Create Vercel account at https://vercel.com (free tier available)
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create GitHub account (if not already) and push code
- [ ] Obtain/Create Gmail or SMTP email credentials for notifications

### MongoDB Atlas Setup

- [ ] Log in to MongoDB Atlas
- [ ] Create a new cluster (free tier M0)
  - [ ] Cluster name: `healthcare-prod`
  - [ ] Provider: AWS
  - [ ] Region: Choose closest to your users
  - [ ] Tier: M0 (free)
- [ ] Wait for cluster to be ready (~3 minutes)
- [ ] Click "Connect" → "Drivers"
- [ ] Copy connection string: `mongodb+srv://username:password@...`
- [ ] Create database user with strong password
- [ ] Go to "Network Access" → "Add IP Address"
  - [ ] Add 0.0.0.0/0 (allows Vercel access)
- [ ] Test connection string is valid

### Generate Secure Secrets

- [ ] Open terminal/PowerShell
- [ ] Navigate to project directory
- [ ] Run `scripts/generate-env.sh` (Linux/Mac) or `scripts/generate-env.bat` (Windows)
- [ ] Save output securely (don't commit to GitHub)
- [ ] Generate at least:
  - [ ] JWT_SECRET (32+ chars)
  - [ ] JWT_REFRESH_SECRET (32+ chars)
  - [ ] ENCRYPTION_KEY (32 chars)
  - [ ] SESSION_SECRET (32+ chars)

### Prepare GitHub Repository

- [ ] Push all changes to GitHub main branch
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Check repository structure is correct:
  ```
  project-root/
  ├── backend/
  ├── frontend/
  ├── api/
  ├── docs/
  └── vercel.json
  ```

---

## Phase 2: Backend Deployment (20 minutes)

### Step 1: Create Backend Project in Vercel

1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New" → "Project"
3. [ ] Select your GitHub repository
4. [ ] Configure:
   - [ ] Framework Preset: `Other`
   - [ ] Root Directory: `./` (root of repo, not /backend)
   - [ ] Build Command: `echo 'Backend uses serverless functions'`
   - [ ] Output Directory: (leave empty)
   - [ ] Install Command: (leave default)
5. [ ] Click "Deploy"
6. [ ] Wait for deployment to complete
7. [ ] Note the backend URL (e.g., `https://backend-abc123.vercel.app`)

### Step 2: Configure Backend Environment Variables

1. [ ] In Vercel Backend Project, go to Settings → Environment Variables
2. [ ] Add each variable:

**Critical Variables:**

```
NAME: NODE_ENV
VALUE: production
ENVIRONMENTS: Production

NAME: MONGODB_URI
VALUE: mongodb+srv://username:password@cluster.mongodb.net/healthcare_system?retryWrites=true&w=majority
ENVIRONMENTS: Production

NAME: JWT_SECRET
VALUE: [Generated value from Phase 1]
ENVIRONMENTS: Production

NAME: JWT_REFRESH_SECRET
VALUE: [Generated value from Phase 1]
ENVIRONMENTS: Production

NAME: ENCRYPTION_KEY
VALUE: [Generated value from Phase 1]
ENVIRONMENTS: Production
```

**CORS Configuration:**

```
NAME: ALLOWED_ORIGINS
VALUE: https://[FRONTEND_URL].vercel.app
ENVIRONMENTS: Production
```

_(Note: Set frontend URL after it's deployed, or update later)_

**Email Configuration:**

```
NAME: SMTP_HOST
VALUE: smtp.gmail.com
ENVIRONMENTS: Production

NAME: SMTP_PORT
VALUE: 587
ENVIRONMENTS: Production

NAME: SMTP_USER
VALUE: your-email@gmail.com
ENVIRONMENTS: Production

NAME: SMTP_PASS
VALUE: your_app_password_from_gmail
ENVIRONMENTS: Production

NAME: SMTP_SECURE
VALUE: false
ENVIRONMENTS: Production
```

**Other Variables:**

```
NAME: JWT_EXPIRES_IN
VALUE: 15m

NAME: JWT_REFRESH_EXPIRES_IN
VALUE: 7d

NAME: BCRYPT_ROUNDS
VALUE: 12

NAME: SESSION_SECRET
VALUE: [Generated value from Phase 1]

NAME: RATE_LIMIT_WINDOW_MS
VALUE: 900000

NAME: RATE_LIMIT_MAX_REQUESTS
VALUE: 100

NAME: LOG_LEVEL
VALUE: info
```

- [ ] After adding all variables, redeploy:
  - Go to "Deployments" → "Redeploy" latest deployment

### Step 3: Test Backend

1. [ ] Open backend URL in browser: `https://your-backend.vercel.app/health`
   - Should see: `{"status":"ok","timestamp":"..."}`
2. [ ] Test API endpoint: `https://your-backend.vercel.app/api`
   - Should see API documentation
3. [ ] Check logs in Vercel:
   - Go to "Deployments" → Latest → "Logs"
   - Look for "Database connected successfully"
   - If you see errors about `MONGODB_URI`, review the connection string format

4. [ ] **Save Backend URL** for next phase

---

## Phase 3: Frontend Deployment (20 minutes)

### Step 1: Create Frontend Project in Vercel

1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New" → "Project"
3. [ ] Select your GitHub repository again
4. [ ] Configure:
   - [ ] Framework Preset: `React`
   - [ ] Root Directory: `./frontend`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `build`
   - [ ] Install Command: (leave default)
5. [ ] Click "Deploy"
6. [ ] Wait for deployment to complete
7. [ ] Note the frontend URL (e.g., `https://frontend-xyz789.vercel.app`)

### Step 2: Configure Frontend Environment Variables

1. [ ] In Vercel Frontend Project, go to Settings → Environment Variables
2. [ ] Add:

```
NAME: REACT_APP_API_URL
VALUE: https://[YOUR-BACKEND-URL].vercel.app/api
ENVIRONMENTS: Production
```

Other optional variables:

```
NAME: REACT_APP_API_TIMEOUT
VALUE: 30000

NAME: REACT_APP_ENABLE_DEBUG
VALUE: false

NAME: REACT_APP_LOG_LEVEL
VALUE: error

NAME: REACT_APP_SESSION_TIMEOUT
VALUE: 900000

NAME: REACT_APP_MAX_LOGIN_ATTEMPTS
VALUE: 5

NAME: REACT_APP_PASSWORD_MIN_LENGTH
VALUE: 8
```

- [ ] Click "Save" for each
- [ ] Redeploy from "Deployments" → "Redeploy"

### Step 3: Test Frontend

1. [ ] Open frontend URL in browser: `https://your-frontend.vercel.app`
2. [ ] Verify it loads without errors
3. [ ] Check browser console (F12) for any errors
4. [ ] If you see CORS errors or API errors, go back to Backend and update `ALLOWED_ORIGINS` with the frontend URL

---

## Phase 4: Backend Update (Post-Frontend) (5 minutes)

### Update Backend CORS for Frontend

1. [ ] Go back to Backend Project in Vercel
2. [ ] Settings → Environment Variables
3. [ ] Update `ALLOWED_ORIGINS`:
   ```
   NAME: ALLOWED_ORIGINS
   VALUE: https://[YOUR-FRONTEND-URL].vercel.app
   ```
4. [ ] Redeploy backend

---

## Phase 5: Integration Testing (15 minutes)

### Test Complete Workflow

- [ ] Go to frontend: `https://your-frontend.vercel.app`
- [ ] Test User Registration:
  - [ ] Fill in registration form with test data
  - [ ] Submit
  - [ ] Should see success message (or email check message)
  - [ ] Check console (F12) for errors
  - [ ] If email is configured, check inbox for verification

- [ ] Test Login:
  - [ ] Use registered credentials
  - [ ] Should successfully log in
  - [ ] Should see dashboard

- [ ] Test API Health:
  - [ ] Open: `https://your-backend.vercel.app/health`
  - [ ] Should return JSON with status "ok"

- [ ] Test Database Connection:
  - [ ] Backend should have created user in MongoDB
  - [ ] Go to MongoDB Atlas → Browse Collections
  - [ ] Verify user document exists in `users` collection

- [ ] Check Backend Logs:
  - [ ] Vercel Backend → Deployments → Logs
  - [ ] Should see request logs from frontend
  - [ ] Should NOT see database connection errors

---

## Phase 6: Production Hardening (10 minutes)

### Security Review

- [ ] Verify all environment variables are set (especially JWT_SECRET)
- [ ] Verify ALLOWED_ORIGINS is restrictive (not `*`)
- [ ] Verify NODE_ENV is `production`
- [ ] Check that `REACT_APP_ENABLE_DEBUG` is `false`
- [ ] Verify database IP whitelist is correct

### Monitoring Setup

- [ ] Enable Vercel email notifications:
  - Backend Project → Settings → Analytics → Enable emails
  - Frontend Project → Settings → Analytics → Enable emails
- [ ] Monitor Database:
  - MongoDB Atlas → Project → Alerts
  - Set up alerts for high connection count

### Backup Verification

- [ ] MongoDB Atlas → Backup → Verify backups are set to automatic

---

## Phase 7: Final Verification Checklist

### Functionality

- [ ] User Registration works
- [ ] User Login works
- [ ] Email notifications sent (if SMTP configured)
- [ ] Database queries executing
- [ ] File uploads working (if uploaded)
- [ ] Logout works

### Performance

- [ ] Frontend loads in <2 seconds
- [ ] API responses in <500ms
- [ ] No 404 or 500 errors

### Security

- [ ] HTTPS working (automatic with Vercel)
- [ ] CORS errors resolved
- [ ] No sensitive data in browser console
- [ ] No hardcoded secrets in frontend

### Monitoring

- [ ] Check Vercel dashboard for errors
- [ ] Review backend logs for warnings
- [ ] Monitor database connection pool health

---

## Troubleshooting Quick Guide

### "Cannot connect to MongoDB"

- [ ] Check MONGODB_URI format
- [ ] Verify IP whitelist on MongoDB Atlas (should include 0.0.0.0/0)
- [ ] Test connection string locally first
- [ ] Check MongoDB cluster is running

### "CORS Error or 403 Forbidden"

- [ ] Update `ALLOWED_ORIGINS` with frontend URL
- [ ] Redeploy backend after changing
- [ ] Check frontend is using correct API_URL

### "Email not sending"

- [ ] Verify SMTP credentials are correct
- [ ] For Gmail: use App Password (not regular password)
- [ ] Check if Gmail account has 2FA enabled
- [ ] Review backend logs for SMTP errors

### "Frontend shows blank page or 404"

- [ ] Check REACT_APP_API_URL is correctly set
- [ ] Check frontend build succeeded in Vercel logs
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Check browser console for JavaScript errors

### "Backend returns 500 errors"

- [ ] Check backend logs in Vercel
- [ ] Verify all required environment variables are set
- [ ] Check database connection with /health endpoint
- [ ] Look for JWT_SECRET not configured error

---

## Environment Variables Checklist

### Backend (All Must Be Set)

- [ ] NODE_ENV = `production`
- [ ] MONGODB_URI = `mongodb+srv://...`
- [ ] JWT_SECRET = 32+ characters
- [ ] JWT_REFRESH_SECRET = 32+ characters
- [ ] ENCRYPTION_KEY = 32 characters
- [ ] ALLOWED_ORIGINS = frontend URL
- [ ] SMTP_HOST = `smtp.gmail.com`
- [ ] SMTP_PORT = `587`
- [ ] SMTP_USER = email
- [ ] SMTP_PASS = app password

### Frontend (Must Be Set)

- [ ] REACT_APP_API_URL = backend URL + `/api`

---

## Support Resources

If you encounter issues:

1. Check Vercel logs first: Project → Deployments → Latest → Logs
2. Check MongoDB Atlas status: atlas.mongodb.com → Status
3. Review docs:
   - Backend: `docs/VERCEL_DEPLOYMENT.md`
   - Frontend: `docs/VERCEL_ENV_QUICK_REFERENCE.md`
4. Search GitHub Issues in your repository
5. Check Vercel documentation: vercel.com/docs

---

**Estimated Total Time**: 1-1.5 hours
**Complexity**: Medium (straightforward for developers)

Good luck with your deployment! 🚀
