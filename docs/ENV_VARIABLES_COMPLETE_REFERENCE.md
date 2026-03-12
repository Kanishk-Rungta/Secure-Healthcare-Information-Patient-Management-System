# Environment Variables Complete Reference

## All Environment Variables for Vercel Deployment

This document contains the complete list of all environment variables needed for both frontend and backend on Vercel.

---

## BACKEND ENVIRONMENT VARIABLES

Set all of these in Vercel: Backend Project → Settings → Environment Variables

### Tier 1: CRITICAL (Must Set) ⚠️

| Variable               | Type   | Example Value                                                                | Description                                                |
| ---------------------- | ------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **NODE_ENV**           | String | `production`                                                                 | Application environment (MUST be production)               |
| **MONGODB_URI**        | String | `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority` | MongoDB Atlas connection string                            |
| **JWT_SECRET**         | String | Min 32 hex chars                                                             | Signing key for access tokens - must be unique and strong  |
| **JWT_REFRESH_SECRET** | String | Min 32 hex chars                                                             | Signing key for refresh tokens - must be unique and strong |
| **ENCRYPTION_KEY**     | String | 32 hex characters                                                            | Data encryption key for sensitive fields                   |

### Tier 2: IMPORTANT (Should Set) 📌

| Variable            | Type    | Example Value                 | Description                                     |
| ------------------- | ------- | ----------------------------- | ----------------------------------------------- |
| **ALLOWED_ORIGINS** | String  | `https://app-name.vercel.app` | CORS whitelist (comma-separated for multiple)   |
| **SMTP_HOST**       | String  | `smtp.gmail.com`              | Email server hostname                           |
| **SMTP_PORT**       | Number  | `587`                         | Email server port                               |
| **SMTP_SECURE**     | Boolean | `false`                       | Use TLS/SSL (false = STARTTLS, true = SSL)      |
| **SMTP_USER**       | String  | `your-email@gmail.com`        | Email account username                          |
| **SMTP_PASS**       | String  | `app-password`                | Email account password or app-specific password |
| **SESSION_SECRET**  | String  | Min 32 chars                  | Session encryption secret                       |
| **BCRYPT_ROUNDS**   | Number  | `12`                          | Password hashing iterations                     |

### Tier 3: OPTIONAL (Has Defaults) 🔧

| Variable                | Type    | Default  | Example  | Description                              |
| ----------------------- | ------- | -------- | -------- | ---------------------------------------- |
| JWT_EXPIRES_IN          | String  | `15m`    | `15m`    | Access token expiration time             |
| JWT_REFRESH_EXPIRES_IN  | String  | `7d`     | `7d`     | Refresh token expiration time            |
| RATE_LIMIT_WINDOW_MS    | Number  | 900000   | 900000   | Rate limit window (milliseconds)         |
| RATE_LIMIT_MAX_REQUESTS | Number  | 100      | 100      | Max requests per window                  |
| MAX_FILE_SIZE           | Number  | 10485760 | 10485760 | Max file upload size (bytes = 10MB)      |
| LOG_LEVEL               | String  | info     | `info`   | Logging level (error, warn, info, debug) |
| ENABLE_METRICS          | Boolean | true     | `true`   | Enable performance metrics               |
| DEBUG                   | String  | (none)   | `app:*`  | Debug namespace (for console debug logs) |

---

## FRONTEND ENVIRONMENT VARIABLES

Set all of these in Vercel: Frontend Project → Settings → Environment Variables

**Important**: Frontend env vars must be prefixed with `REACT_APP_` to be accessible in React

### Tier 1: CRITICAL (Must Set) ⚠️

| Variable              | Type   | Example Value                         | Notes                                      |
| --------------------- | ------ | ------------------------------------- | ------------------------------------------ |
| **REACT_APP_API_URL** | String | `https://backend-name.vercel.app/api` | Backend API base URL (must include `/api`) |

### Tier 2: OPTIONAL BUT RECOMMENDED 📌

| Variable                       | Type    | Default  | Example  | Description                              |
| ------------------------------ | ------- | -------- | -------- | ---------------------------------------- |
| REACT_APP_API_TIMEOUT          | Number  | 30000    | 30000    | API request timeout (milliseconds)       |
| REACT_APP_SESSION_TIMEOUT      | Number  | 900000   | 900000   | Session timeout (milliseconds = 15 mins) |
| REACT_APP_MAX_LOGIN_ATTEMPTS   | Number  | 5        | 5        | Failed login attempts before lockout     |
| REACT_APP_PASSWORD_MIN_LENGTH  | Number  | 8        | 8        | Minimum password length                  |
| REACT_APP_MAX_FILE_SIZE        | Number  | 10485760 | 10485760 | Max file upload size (bytes)             |
| REACT_APP_ENABLE_NOTIFICATIONS | Boolean | true     | true     | Enable toast notifications               |

### Tier 3: PRODUCTION SETTINGS 🔧

| Variable                   | Type    | Production | Development |
| -------------------------- | ------- | ---------- | ----------- |
| REACT_APP_ENABLE_DEBUG     | Boolean | `false`    | `true`      |
| REACT_APP_LOG_LEVEL        | String  | `error`    | `debug`     |
| REACT_APP_ENABLE_ANALYTICS | Boolean | `false`    | `false`     |
| REACT_APP_DEV_MODE         | Boolean | `false`    | `true`      |

---

## How to Set Variables in Vercel

### For Backend:

1. Login to Vercel Dashboard
2. Select your Backend project
3. Go to **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Click **Add New**
6. Enter:
   - **Name**: Variable name (e.g., `MONGODB_URI`)
   - **Value**: The actual value
   - **Environments**: Select `Production` (or all environments)
7. Click **Add**
8. Repeat for all variables
9. Go to **Deployments** and click **Redeploy** on latest deployment

### For Frontend:

Same process as backend, but remember to prefix with `REACT_APP_`

---

## Environment Variable Checklist

### Before Deployment

- [ ] **MongoDB URI**
  - [ ] Get connection string from MongoDB Atlas
  - [ ] Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
  - [ ] Database user created in Atlas
  - [ ] IP whitelist includes `0.0.0.0/0`
  - [ ] Test connection locally first

- [ ] **JWT Secrets**
  - [ ] Generate using: `openssl rand -base64 32`
  - [ ] Create TWO different secrets (one for access, one for refresh)
  - [ ] Each must be at least 32 characters
  - [ ] Store securely (not in version control)
  - [ ] Keep for future reference (can't retrieve from Vercel)

- [ ] **Encryption Key**
  - [ ] Generate using: `openssl rand -hex 16`
  - [ ] Results in 32 hex characters
  - [ ] Must be exactly 32 characters
  - [ ] Keep for future reference

- [ ] **Email (SMTP)**
  - [ ] For Gmail: Create App Password
    - Enable 2FA and security keys on Gmail
    - Go to myaccount.google.com/apppasswords
    - Select Mail and Windows Computer
    - Copy app-specific password
  - [ ] Test SMTP credentials locally before setting on Vercel
  - [ ] Verify emails are being sent after deployment

- [ ] **CORS/Origins**
  - [ ] Get exact frontend URL from Vercel
  - [ ] Format: `https://your-app.vercel.app`
  - [ ] Don't include `/api` or trailing slash
  - [ ] Update backend CORS after frontend is deployed

- [ ] **Frontend API URL**
  - [ ] Get exact backend URL from Vercel
  - [ ] Format: `https://your-api.vercel.app/api`
  - [ ] MUST include `/api` at the end
  - [ ] Test by visiting URL in browser (should see API docs)

---

## Generating Secure Values

### On Linux/Mac:

```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate JWT Refresh Secret (different value)
openssl rand -base64 32

# Generate Encryption Key (exactly 32 hex chars)
openssl rand -hex 16

# Generate Session Secret
openssl rand -base64 32
```

### On Windows PowerShell:

```powershell
# Generate random base64 string
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Generate hex string (32 chars)
-join((0..15) | ForEach-Object { [Math]::Floor([Math]::Random() * 16).ToString('X') })
```

### Using the provided scripts:

```bash
# Linux/Mac
bash scripts/generate-env.sh

# Windows
scripts\generate-env.bat
```

---

## Validation Checklist

### After Setting Backend Variables

- [ ] `NODE_ENV` = `production`
- [ ] `MONGODB_URI` = Valid connection string
- [ ] `JWT_SECRET` = Minimum 32 characters
- [ ] `JWT_REFRESH_SECRET` = Minimum 32 characters
- [ ] `ENCRYPTION_KEY` = Exactly 32 characters
- [ ] `ALLOWED_ORIGINS` = Production frontend URL
- [ ] SMTP variables = Valid email credentials
- [ ] At least one user can be created and authenticated

### After Setting Frontend Variables

- [ ] `REACT_APP_API_URL` = Valid backend URL with `/api`
- [ ] Frontend loads without 404 errors
- [ ] Frontend can make API calls (check Network tab)
- [ ] No CORS errors in browser console

---

## Environment Variable Security

### DO's ✅

- DO use unique, random values for secrets
- DO store secrets in Vercel environment only (never in code)
- DO use minimum 32 characters for encryption keys
- DO rotate secrets periodically
- DO keep backup of secrets in secure location
- DO test locally before deploying
- DO review environment variables before deployment

### DON'Ts ❌

- DON'T commit `.env` files to GitHub
- DON'T use default or example values in production
- DON'T share secrets via email or Slack
- DON'T use weak passwords for MongoDB
- DON'T set `ALLOWED_ORIGINS` to `*` in production
- DON'T leave debug mode enabled in production
- DON'T store sensitive data in localStorage (frontend)

---

## Troubleshooting Environment Variables

### "Invalid environment variable"

- Check for extra spaces or line breaks
- Ensure value is properly formatted
- For MongoDB URI: Check `mongodb+srv` prefix
- For URLs: Don't include quotes

### "Database connection refused"

- Check MONGODB_URI is correct
- Check MongoDB cluster is running
- Check IP whitelist includes `0.0.0.0/0`
- Test connection string locally first

### "JWT_SECRET not configured"

- Check variable is set in Vercel
- Check it's set in Production environment
- Check value is not empty
- Redeploy backend after setting

### "Cannot reach backend from frontend"

- Check REACT_APP_API_URL is correct
- Check ALLOWED_ORIGINS includes frontend URL
- Check backend is responding to `/health`
- Check for CORS headers in browser Network tab

### "Email not sending"

- Check SMTP credentials are correct
- For Gmail: Use app-specific password (not regular password)
- Check SMTP host is correct (`smtp.gmail.com`)
- Check SMTP port is correct (`587`)
- Review backend logs for SMTP errors

---

## Reference URLs

- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Gmail App Passwords: https://myaccount.google.com/apppasswords
- Environment Variables Best Practices: https://12factor.net/config

---

**Last Updated**: March 2026
**Version**: 1.0.0
