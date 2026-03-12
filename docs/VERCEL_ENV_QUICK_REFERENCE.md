# Quick Environment Variables Reference for Vercel

## BACKEND - Must Set These Variables in Vercel

### Database (CRITICAL)

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare_system?retryWrites=true&w=majority

### JWT Authentication (CRITICAL)

JWT_SECRET=your_32_character_minimum_super_secret_key_here_change_this
JWT_REFRESH_SECRET=your_32_character_minimum_super_secret_key_here_change_this

### Other Critical

NODE_ENV=production
ENCRYPTION_KEY=your_32_character_encryption_key_here

### Email (Important - without this, emails won't send)

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_specific_password

### Security

ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
BCRYPT_ROUNDS=12

### Optional (defaults apply if not set)

JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
LOG_LEVEL=info
ENABLE_METRICS=true

---

## FRONTEND - Must Set These Variables in Vercel

### API Configuration (CRITICAL)

REACT_APP_API_URL=https://your-backend-vercel-url.vercel.app/api

### Optional (with sensible defaults)

REACT_APP_API_TIMEOUT=30000
REACT_APP_NAME=Healthcare Management System
REACT_APP_ENABLE_DEBUG=false
REACT_APP_SESSION_TIMEOUT=900000
REACT_APP_MAX_LOGIN_ATTEMPTS=5
REACT_APP_PASSWORD_MIN_LENGTH=8
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_LOG_LEVEL=error

---

## How to Set Environment Variables in Vercel

1. Go to your Vercel Project Dashboard
2. Click "Settings"
3. Select "Environment Variables"
4. Click "Add New"
5. Enter Variable Name and Value
6. Select which environments (Production, Preview, Development)
7. Click "Add"
8. Redeploy the project for changes to take effect

---

## Important Notes

1. **Change All Secrets!** - Don't use example values - generate new unique values
2. **MONGODB_URI** - Get this from MongoDB Atlas cluster (Connection String)
3. **JWT Secrets** - Use `openssl rand -base64 32` to generate
4. **SMTP_PASS** for Gmail - Must use App Password (not regular password)
5. **ALLOWED_ORIGINS** - Should be your actual frontend URL
6. **REACT_APP_API_URL** - Should be your actual backend Vercel URL

---

Generate strong secrets:

- Windows PowerShell:
  ```
  -join((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
  ```
- Linux/Mac:
  ```
  openssl rand -base64 32
  ```
