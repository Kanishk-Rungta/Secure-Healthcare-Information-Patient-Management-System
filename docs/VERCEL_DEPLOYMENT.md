# Quick Vercel Deployment Guide - Minimum Required Setup

## 🚀 TL;DR - Only Need These 3 Steps

1. **Create MongoDB cluster** → Get connection string
2. **Generate 3 random values** → Copy below
3. **Set 6 environment variables** → Done!

---

## Step 1: MongoDB Atlas Setup (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free tier cluster
3. Create database user with password
4. Go to **Network Access** → **Add IP Address** → Add `0.0.0.0/0`
5. Click **Connect** → **Drivers** → Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/...`

---

## Step 2: Generate Required Values

**On Linux/Mac:**

```bash
openssl rand -base64 32    # First random value
openssl rand -base64 32    # Second random value
openssl rand -hex 16       # Third random value (32 chars)
```

**On Windows PowerShell:**

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
-join((0..15) | ForEach-Object { [Math]::Floor([Math]::Random() * 16).ToString('X') })
```

Or just run: `scripts/generate-env.bat`

---

## Step 3: Deploy Backend

1. Go to https://vercel.com/dashboard
2. **Add New** → **Project** → Select GitHub repo
3. Click **Deploy**
4. Go to **Settings** → **Environment Variables** → Add these 5:

| Name                 | Value                                                                |
| -------------------- | -------------------------------------------------------------------- |
| `MONGODB_URI`        | `mongodb+srv://user:pass@cluster.mongodb.net/...`                    |
| `JWT_SECRET`         | `[First random value from Step 2]`                                   |
| `JWT_REFRESH_SECRET` | `[Second random value from Step 2]`                                  |
| `ENCRYPTION_KEY`     | `[Third random value from Step 2]`                                   |
| `ALLOWED_ORIGINS`    | `https://your-frontend-url.vercel.app` _(set after frontend deploy)_ |

5. Go to **Deployments** → **Redeploy** latest

---

## Step 4: Deploy Frontend

1. **Add New** → **Project** → Select GitHub repo
2. Root Directory: `./frontend`
3. Click **Deploy**
4. Go to **Settings** → **Environment Variables** → Add this 1:

| Name                | Value                                            |
| ------------------- | ------------------------------------------------ |
| `REACT_APP_API_URL` | `https://your-backend-vercel-url.vercel.app/api` |

5. **Redeploy**

---

## Step 5: Update Backend CORS (Optional)

1. Go back to **Backend Project** in Vercel
2. **Settings** → **Environment Variables**
3. Update `ALLOWED_ORIGINS` with actual frontend URL
4. **Redeploy**

---

## ✅ Testing

- Frontend: https://your-frontend.vercel.app (should load)
- Backend: https://your-backend.vercel.app/health (should see `{"status":"ok",...}`)
- Try registering a user and logging in

---

## 🆘 Troubleshooting

**"Database connection failed"**

- MongoDB URI is wrong format
- IP whitelist on MongoDB needs `0.0.0.0/0`

**"Cannot reach backend"**

- `REACT_APP_API_URL` is wrong
- `ALLOWED_ORIGINS` doesn't match frontend URL

**"JWT Secret not configured"**

- Variable not set in Vercel
- Need to redeploy after setting it

---

**That's it! Your app is live.** 🎉

For optional features (email, advanced logging, etc), see docs/ENV_VARIABLES_COMPLETE_REFERENCE.md
