# 🚀 Complete Deployment Tutorial: Railway + Vercel

This comprehensive guide will walk you through deploying your Boom Karaoke Booking System on Railway (backend) and Vercel (frontend) with detailed screenshots and explanations.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Railway Backend Deployment](#railway-backend-deployment)
3. [Vercel Frontend Deployment](#vercel-frontend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Testing Your Deployment](#testing-your-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Post-Deployment Setup](#post-deployment-setup)

---

## Prerequisites

### Required Accounts
- **GitHub Account** (free)
- **Railway Account** (free tier available)
- **Vercel Account** (free tier available)

### Required Tools
- **Web Browser** (Chrome, Firefox, Safari, Edge)
- **Terminal/Command Prompt** (optional, for advanced users)

### Repository Access
- Your repository: `https://github.com/samueljai120/Advanced-Calendar`
- Root directory for backend: `Boom-Booking-Isolate/backend`
- Root directory for frontend: `Boom-Booking-Isolate`

---

## Railway Backend Deployment

### Step 1: Create Railway Account

1. **Go to Railway:** https://railway.app
2. **Click "Sign Up"** in the top right
3. **Choose "Sign up with GitHub"**
4. **Authorize Railway** to access your GitHub account
5. **Complete your profile** (optional)

### Step 2: Create New Project

1. **Click "New Project"** on the Railway dashboard
2. **Select "Deploy from GitHub repo"**
3. **Search for your repository:** `Advanced-Calendar`
4. **Click on your repository** when it appears

### Step 3: Configure Service Settings

1. **Set Root Directory:**
   - In the "Root Directory" field, enter: `Boom-Booking-Isolate/backend`
   - This tells Railway to deploy only the backend folder

2. **Railway will automatically detect:**
   - ✅ `railway.json` - Deployment configuration
   - ✅ `Dockerfile` - Container configuration
   - ✅ `package.json` - Node.js dependencies
   - ✅ `nixpacks.toml` - Build optimization

3. **Click "Deploy"** to start the deployment

### Step 4: Add PostgreSQL Database

1. **In your project dashboard, click "New Service"**
2. **Select "Database"**
3. **Choose "PostgreSQL"**
4. **Railway will automatically:**
   - Create a PostgreSQL database
   - Provide `DATABASE_URL` environment variable
   - Set up connection pooling

### Step 5: Configure Environment Variables

1. **Go to your backend service**
2. **Click on "Variables" tab**
3. **Add the following variables:**

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret-change-this-now
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=*
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
ENABLE_METRICS=true
DEFAULT_TIMEZONE=America/New_York
DEFAULT_CURRENCY=USD
BOOKING_ADVANCE_DAYS=30
BOOKING_MIN_DURATION=60
BOOKING_MAX_DURATION=480
```

**Important Notes:**
- Replace `JWT_SECRET` with a strong, random string (32+ characters)
- `DATABASE_URL` is automatically provided by Railway
- `CORS_ORIGIN` will be updated after frontend deployment

### Step 6: Monitor Deployment

1. **Watch the deployment logs** in real-time
2. **Look for these success indicators:**
   ```
   ✅ PostgreSQL connection established successfully
   ✅ Multi-tenant database schema created successfully
   ✅ Default tenant and data created successfully
   ✅ Production server running on port 5000
   ```

3. **Get your Railway URL:**
   - Click on your service
   - Copy the URL (e.g., `https://your-app-name.railway.app`)

---

## Vercel Frontend Deployment

### Step 1: Create Vercel Account

1. **Go to Vercel:** https://vercel.com
2. **Click "Sign Up"** in the top right
3. **Choose "Continue with GitHub"**
4. **Authorize Vercel** to access your GitHub account
5. **Complete your profile** (optional)

### Step 2: Import Project

1. **Click "New Project"** on the Vercel dashboard
2. **Click "Import Git Repository"**
3. **Search for your repository:** `Advanced-Calendar`
4. **Click "Import"** next to your repository

### Step 3: Configure Project Settings

1. **Project Name:** `boom-booking-frontend` (or your preferred name)
2. **Root Directory:** `Boom-Booking-Isolate`
3. **Framework Preset:** Vite (should auto-detect)
4. **Build Command:** `npm run build` (should auto-detect)
5. **Output Directory:** `dist` (should auto-detect)

### Step 4: Configure Environment Variables

1. **In the "Environment Variables" section, add:**

```env
VITE_API_BASE_URL=https://your-railway-backend.railway.app/api
VITE_WS_URL=https://your-railway-backend.railway.app
VITE_APP_NAME=Boom Karaoke Booking
VITE_APP_VERSION=1.0.0
```

**Important:** Replace `your-railway-backend.railway.app` with your actual Railway URL

### Step 5: Deploy

1. **Click "Deploy"**
2. **Wait for the build to complete** (usually 2-3 minutes)
3. **Get your Vercel URL** (e.g., `https://boom-booking-frontend.vercel.app`)

---

## Environment Configuration

### Step 1: Update CORS Settings

1. **Go back to Railway dashboard**
2. **Navigate to your backend service**
3. **Go to "Variables" tab**
4. **Update `CORS_ORIGIN`:**
   - Change from `*` to your Vercel URL
   - Example: `https://boom-booking-frontend.vercel.app`

### Step 2: Configure Additional Services (Optional)

#### Email Configuration (if using email features)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=Boom Booking <your-email@gmail.com>
```

#### Stripe Configuration (if using payments)
```env
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## Testing Your Deployment

### Step 1: Test Backend Health

1. **Open your Railway URL** in a browser
2. **Add `/api/health` to the URL:**
   ```
   https://your-railway-backend.railway.app/api/health
   ```
3. **Expected response:**
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.456,
     "version": "1.0.0"
   }
   ```

### Step 2: Test Frontend

1. **Open your Vercel URL** in a browser
2. **Verify the application loads** without errors
3. **Check browser console** for any JavaScript errors
4. **Test navigation** between different pages

### Step 3: Test API Integration

1. **Open browser developer tools** (F12)
2. **Go to Network tab**
3. **Perform actions** in your frontend (login, booking, etc.)
4. **Verify API calls** are being made to your Railway backend
5. **Check for CORS errors** in the console

---

## Troubleshooting

### Common Railway Issues

#### Issue: Build Failures
**Symptoms:** Deployment fails during build process
**Solutions:**
1. Check Railway logs for specific error messages
2. Verify Node.js version compatibility
3. Ensure all dependencies are in `package.json`
4. Check for TypeScript compilation errors

#### Issue: Database Connection Errors
**Symptoms:** "Database connection failed" errors
**Solutions:**
1. Verify PostgreSQL service is running
2. Check `DATABASE_URL` environment variable
3. Ensure database initialization scripts are working
4. Check database permissions

#### Issue: Port Conflicts
**Symptoms:** "Port already in use" errors
**Solutions:**
1. Railway automatically assigns ports
2. Use `process.env.PORT` in your code
3. Don't hardcode port numbers

### Common Vercel Issues

#### Issue: Build Failures
**Symptoms:** Frontend deployment fails
**Solutions:**
1. Check Vercel build logs
2. Verify all dependencies are installed
3. Check for TypeScript/JavaScript errors
4. Ensure build command is correct

#### Issue: Environment Variables Not Working
**Symptoms:** API calls failing, wrong URLs
**Solutions:**
1. Verify environment variables are set correctly
2. Check variable names (must start with `VITE_`)
3. Redeploy after changing environment variables
4. Check for typos in URLs

#### Issue: CORS Errors
**Symptoms:** "Access to fetch blocked by CORS policy"
**Solutions:**
1. Update `CORS_ORIGIN` in Railway with exact Vercel URL
2. Ensure URLs match exactly (including https://)
3. Check for trailing slashes
4. Redeploy backend after CORS changes

### Debug Commands

#### Check Railway Logs
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# View logs
railway logs
```

#### Check Vercel Logs
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# View logs
vercel logs
```

---

## Post-Deployment Setup

### Step 1: Custom Domains (Optional)

#### Railway Custom Domain
1. **Go to Railway dashboard**
2. **Click on your service**
3. **Go to "Settings" → "Domains"**
4. **Add your custom domain**
5. **Configure DNS records** as instructed

#### Vercel Custom Domain
1. **Go to Vercel dashboard**
2. **Click on your project**
3. **Go to "Settings" → "Domains"**
4. **Add your custom domain**
5. **Configure DNS records** as instructed

### Step 2: SSL Certificates

Both Railway and Vercel provide **automatic SSL certificates**:
- ✅ HTTPS enabled by default
- ✅ Automatic certificate renewal
- ✅ HTTP to HTTPS redirects

### Step 3: Monitoring Setup

#### Railway Monitoring
1. **Go to Railway dashboard**
2. **Click on your service**
3. **View metrics:** CPU, Memory, Network
4. **Set up alerts** for errors and performance

#### Vercel Monitoring
1. **Go to Vercel dashboard**
2. **Click on your project**
3. **View analytics:** Page views, Performance
4. **Set up alerts** for deployments and errors

### Step 4: Backup Strategy

#### Database Backups
1. **Railway automatically backs up** PostgreSQL databases
2. **Manual backups:** Export database via Railway CLI
3. **Regular exports:** Set up automated database exports

#### Code Backups
1. **GitHub provides** automatic code backups
2. **Multiple branches:** Use feature branches
3. **Release tags:** Tag stable versions

---

## 🎉 Deployment Complete!

### Your URLs
- **Backend (Railway):** `https://your-app-name.railway.app`
- **Frontend (Vercel):** `https://boom-booking-frontend.vercel.app`

### Next Steps
1. **Test all functionality** thoroughly
2. **Set up monitoring** and alerts
3. **Configure custom domains** if needed
4. **Set up automated backups**
5. **Plan for scaling** as your user base grows

### Support Resources
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Issues:** Create issues in your repository
- **Community Forums:** Railway and Vercel community forums

---

**Congratulations! Your Boom Karaoke Booking System is now live in production! 🚀**
