# 🎯 Step-by-Step Deployment Guide

## 🚀 Railway Backend Deployment (Detailed)

### Step 1: Access Railway
1. **Open your browser** and go to: https://railway.app
2. **Click "Sign Up"** (top right corner)
3. **Select "Sign up with GitHub"**
4. **Authorize Railway** when prompted

### Step 2: Create New Project
1. **Click "New Project"** (large blue button on dashboard)
2. **Select "Deploy from GitHub repo"**
3. **In the search box, type:** `Advanced-Calendar`
4. **Click on your repository** when it appears in the list

### Step 3: Configure Service
1. **In the "Root Directory" field, type exactly:**
   ```
   Boom-Booking-Isolate/backend
   ```
2. **Verify these files are detected:**
   - ✅ `railway.json` (Railway configuration)
   - ✅ `Dockerfile` (Container configuration)
   - ✅ `package.json` (Node.js dependencies)
3. **Click "Deploy"** (blue button)

### Step 4: Add Database
1. **After deployment starts, click "New Service"**
2. **Click "Database"**
3. **Select "PostgreSQL"**
4. **Wait for database to be created** (usually 30-60 seconds)

### Step 5: Set Environment Variables
1. **Click on your backend service** (not the database)
2. **Click "Variables" tab**
3. **Add each variable one by one:**

| Variable Name | Value |
|---------------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `JWT_SECRET` | `your-super-secure-jwt-secret-change-this-now` |
| `JWT_EXPIRES_IN` | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | `30d` |
| `CORS_ORIGIN` | `*` |
| `BCRYPT_ROUNDS` | `12` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `LOG_LEVEL` | `info` |
| `ENABLE_METRICS` | `true` |
| `DEFAULT_TIMEZONE` | `America/New_York` |
| `DEFAULT_CURRENCY` | `USD` |
| `BOOKING_ADVANCE_DAYS` | `30` |
| `BOOKING_MIN_DURATION` | `60` |
| `BOOKING_MAX_DURATION` | `480` |

**Note:** `DATABASE_URL` is automatically provided by Railway

### Step 6: Get Railway URL
1. **Click on your backend service**
2. **Copy the URL** (e.g., `https://your-app-name.railway.app`)
3. **Save this URL** - you'll need it for Vercel

---

## 🎨 Vercel Frontend Deployment (Detailed)

### Step 1: Access Vercel
1. **Open your browser** and go to: https://vercel.com
2. **Click "Sign Up"** (top right corner)
3. **Select "Continue with GitHub"**
4. **Authorize Vercel** when prompted

### Step 2: Import Project
1. **Click "New Project"** (large button on dashboard)
2. **Click "Import Git Repository"**
3. **In the search box, type:** `Advanced-Calendar`
4. **Click "Import"** next to your repository

### Step 3: Configure Project
1. **Project Name:** `boom-booking-frontend` (or your preferred name)
2. **Root Directory:** `Boom-Booking-Isolate`
3. **Framework Preset:** Should auto-detect as "Vite"
4. **Build Command:** Should auto-detect as `npm run build`
5. **Output Directory:** Should auto-detect as `dist`

### Step 4: Set Environment Variables
1. **In the "Environment Variables" section, click "Add"**
2. **Add each variable:**

| Variable Name | Value |
|---------------|-------|
| `VITE_API_BASE_URL` | `https://your-railway-backend.railway.app/api` |
| `VITE_WS_URL` | `https://your-railway-backend.railway.app` |
| `VITE_APP_NAME` | `Boom Karaoke Booking` |
| `VITE_APP_VERSION` | `1.0.0` |

**Important:** Replace `your-railway-backend.railway.app` with your actual Railway URL

### Step 5: Deploy
1. **Click "Deploy"** (blue button)
2. **Wait for build to complete** (2-3 minutes)
3. **Copy your Vercel URL** (e.g., `https://boom-booking-frontend.vercel.app`)

---

## 🔄 Update CORS Settings

### Step 1: Update Railway CORS
1. **Go back to Railway dashboard**
2. **Click on your backend service**
3. **Click "Variables" tab**
4. **Find `CORS_ORIGIN` variable**
5. **Change value from `*` to your Vercel URL:**
   ```
   https://boom-booking-frontend.vercel.app
   ```
6. **Click "Update"**

---

## 🧪 Testing Your Deployment

### Test Backend
1. **Open your Railway URL** in a new tab
2. **Add `/api/health` to the end:**
   ```
   https://your-app-name.railway.app/api/health
   ```
3. **Expected result:** JSON response with health status

### Test Frontend
1. **Open your Vercel URL** in a new tab
2. **Verify the application loads**
3. **Check browser console** (F12) for errors
4. **Test navigation** between pages

### Test Integration
1. **Open browser developer tools** (F12)
2. **Go to Network tab**
3. **Try logging in or creating a booking**
4. **Verify API calls** are made to Railway backend
5. **Check for CORS errors**

---

## 🚨 Common Issues & Solutions

### Railway Issues

#### "Build Failed"
**Solution:**
1. Check Railway logs for specific errors
2. Verify all dependencies are in `package.json`
3. Ensure Node.js version compatibility

#### "Database Connection Failed"
**Solution:**
1. Verify PostgreSQL service is running
2. Check `DATABASE_URL` is set automatically
3. Wait for database initialization to complete

#### "Port Already in Use"
**Solution:**
1. Railway handles ports automatically
2. Use `process.env.PORT` in your code
3. Don't hardcode port numbers

### Vercel Issues

#### "Build Failed"
**Solution:**
1. Check Vercel build logs
2. Verify all dependencies are installed
3. Check for JavaScript/TypeScript errors

#### "Environment Variables Not Working"
**Solution:**
1. Ensure variables start with `VITE_`
2. Redeploy after changing variables
3. Check for typos in URLs

#### "CORS Errors"
**Solution:**
1. Update `CORS_ORIGIN` with exact Vercel URL
2. Ensure URLs match exactly
3. Redeploy backend after CORS changes

---

## 📊 Monitoring Your Deployment

### Railway Monitoring
1. **Go to Railway dashboard**
2. **Click on your service**
3. **View metrics:** CPU, Memory, Network usage
4. **Check logs** for any errors

### Vercel Monitoring
1. **Go to Vercel dashboard**
2. **Click on your project**
3. **View analytics:** Page views, Performance metrics
4. **Check function logs** for any errors

---

## 🎉 Success Checklist

- ✅ Backend deployed on Railway
- ✅ Frontend deployed on Vercel
- ✅ Database connected and initialized
- ✅ Environment variables configured
- ✅ CORS settings updated
- ✅ Health checks passing
- ✅ Frontend loads without errors
- ✅ API integration working
- ✅ No CORS errors in console

---

## 🔗 Your Deployment URLs

**Backend (Railway):** `https://your-app-name.railway.app`
**Frontend (Vercel):** `https://boom-booking-frontend.vercel.app`

**Congratulations! Your Boom Karaoke Booking System is now live! 🚀**
