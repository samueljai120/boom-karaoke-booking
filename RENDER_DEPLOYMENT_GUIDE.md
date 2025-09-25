# 🚀 Render.com Backend Deployment Guide

## 📋 **Step-by-Step Instructions**

### **Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### **Step 2: Create New Web Service**
1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub repository: `samueljai120/Advanced-Calendar`

### **Step 3: Configure Service Settings**

**Basic Settings:**
- **Name**: `boom-booking-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `Boom-Booking-Isolate/backend`

**Build & Deploy:**
- **Build Command**: `npm ci --only=production`
- **Start Command**: `node server-railway.js`

**Advanced Settings:**
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: `Yes`

### **Step 4: Environment Variables**
Add these environment variables in Render dashboard:

```
NODE_ENV=production
CORS_ORIGIN=https://boom-booking-frontend.vercel.app
DATABASE_URL=your_railway_postgresql_url_here
```

**To get DATABASE_URL from Railway:**
1. Go to your Railway project
2. Click on PostgreSQL service
3. Copy the connection string from Variables tab

### **Step 5: Deploy**
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Render will provide a URL like: `https://boom-booking-backend-xxxx.onrender.com`

### **Step 6: Test Deployment**
Test these endpoints:
- `GET https://your-backend-url.onrender.com/` - Should return API info
- `GET https://your-backend-url.onrender.com/api/health` - Should return health status
- `GET https://your-backend-url.onrender.com/test` - Should return test message

---

## 🔧 **Expected Results**

After successful deployment, you should see:

### **Backend API Response:**
```json
{
  "message": "Boom Karaoke Booking API",
  "version": "1.0.0",
  "status": "running",
  "environment": "production",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "login": "/api/auth/login",
    "register": "/api/auth/register"
  }
}
```

### **Health Check Response:**
```json
{
  "status": "ok",
  "message": "Backend API is running",
  "timestamp": "2024-09-23T...",
  "environment": "production",
  "database": "Connected"
}
```

---

## 🔄 **Next Steps After Deployment**

### **1. Update Frontend API URL**
Update the frontend to use the new Render backend URL:

**File**: `src/utils/apiConfig.js`
```javascript
// Update these URLs to point to your Render backend
const RENDER_BACKEND_URL = 'https://your-backend-url.onrender.com';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.PROD) {
    return `${RENDER_BACKEND_URL}/api`; // Updated to Render
  }
  return 'http://localhost:5001/api';
};
```

### **2. Test Real Database Connection**
- Try registering a new user
- Test login with real credentials
- Verify data persists between sessions

### **3. Update Vercel Environment Variables**
Add to Vercel dashboard:
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_WS_URL=https://your-backend-url.onrender.com
```

---

## 🎯 **Benefits of Render Deployment**

✅ **Reliable**: Excellent Node.js backend support  
✅ **Fast**: Quick deployment and startup  
✅ **Scalable**: Automatic scaling capabilities  
✅ **Secure**: HTTPS by default  
✅ **Monitoring**: Built-in health checks and logs  
✅ **Free Tier**: 750 hours/month free  

---

## 🔍 **Troubleshooting**

### **If deployment fails:**
1. Check build logs in Render dashboard
2. Verify all dependencies are in `package.json`
3. Ensure `server-railway.js` exists in backend folder

### **If database connection fails:**
1. Verify DATABASE_URL environment variable
2. Check Railway PostgreSQL is running
3. Test database connection separately

### **If CORS errors occur:**
1. Verify CORS_ORIGIN environment variable
2. Check frontend URL matches exactly
3. Test with different CORS settings

---

## 📊 **Deployment Checklist**

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web service created with correct settings
- [ ] Environment variables configured
- [ ] DATABASE_URL from Railway added
- [ ] Deployment successful
- [ ] Health check endpoint working
- [ ] Frontend updated with new API URL
- [ ] Real user registration tested
- [ ] Database persistence verified

---

**🎉 Once deployed, your backend API will be fully functional with real database connectivity!**
