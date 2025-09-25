# 🚀 Local Development Setup - Vercel + Neon

## 🎯 **Complete Local Development Environment**

This guide will help you run the Boom Karaoke Booking app locally with Vercel CLI and Neon database, simulating the production environment.

---

## 📋 **Prerequisites**

### **Required Software:**
- ✅ **Node.js 20.x** (already installed)
- ✅ **npm** (comes with Node.js)
- ✅ **Git** (for version control)

### **Required Accounts:**
- ✅ **Vercel Account** (for CLI and deployment)
- ✅ **Neon Database** (for PostgreSQL database)

---

## 🛠️ **Step 1: Install Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Verify installation
vercel --version
```

---

## 🗄️ **Step 2: Set Up Neon Database**

### **Option A: Use Existing Database (Recommended)**
The project already has a Neon database configured. Use these credentials:

```env
DATABASE_URL=postgresql://neondb_owner:npg_gPcJ0YO9QZzN@ep-patient-surf-ad9p9gn0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### **Option B: Create New Database**
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project: `boom-karaoke-booking`
3. Copy the connection string
4. Update the DATABASE_URL in your environment

---

## 🔧 **Step 3: Environment Configuration**

### **Create `.env.local` file:**
```bash
# Navigate to project directory
cd Boom-Booking-Isolate

# Create environment file
touch .env.local
```

### **Add these environment variables to `.env.local`:**
```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_gPcJ0YO9QZzN@ep-patient-surf-ad9p9gn0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-this-now-local-dev
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=Boom Karaoke Booking
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
NODE_ENV=development
```

---

## 📦 **Step 4: Install Dependencies**

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

---

## 🚀 **Step 5: Start Local Development**

### **Method 1: Vercel Dev (Recommended)**
```bash
# Start Vercel development server
vercel dev

# This will:
# - Start API routes on port 3000
# - Start frontend on port 3000
# - Handle database connections
# - Simulate production environment
```

### **Method 2: Separate Frontend/Backend**
```bash
# Terminal 1: Start Vercel API server
vercel dev --listen 3001

# Terminal 2: Start Vite frontend
npm run dev
```

---

## 🧪 **Step 6: Test Your Setup**

### **Test API Endpoints:**
```bash
# Health check
curl http://localhost:3000/api/health

# Business hours
curl http://localhost:3000/api/business-hours

# Rooms
curl http://localhost:3000/api/rooms

# Authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'
```

### **Test Frontend:**
1. Open browser: http://localhost:3000
2. Test login with: `demo@example.com` / `demo123`
3. Test booking functionality
4. Check browser console for errors

---

## 🔍 **Step 7: Verify Database Connection**

### **Check Database Status:**
```bash
# Test database connection
curl http://localhost:3000/api/health

# Should return:
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

### **Verify Data:**
```bash
# Check if default data was inserted
curl http://localhost:3000/api/rooms
curl http://localhost:3000/api/business-hours
```

---

## 🎯 **Expected Results**

After successful setup:

### **✅ API Functionality:**
- [ ] Health check returns success
- [ ] Business hours API works
- [ ] Rooms API works
- [ ] Login API works
- [ ] Database connection established

### **✅ Frontend Functionality:**
- [ ] Page loads without errors
- [ ] Login form works
- [ ] Calendar displays correctly
- [ ] Booking flow works
- [ ] No CORS errors in console

### **✅ Database Integration:**
- [ ] Database connection works
- [ ] Data persists between requests
- [ ] Authentication uses database
- [ ] Business hours from database
- [ ] Rooms from database

---

## 🚨 **Troubleshooting**

### **Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
vercel dev --port 3001
```

### **Environment Variables Not Loading:**
```bash
# Check if .env.local exists
ls -la .env.local

# Restart dev server
vercel dev
```

### **Database Connection Issues:**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test database connection
curl http://localhost:3000/api/health
```

### **API Routes Not Working:**
```bash
# Check if API directory exists
ls -la api/

# Check Vercel dev server logs
vercel dev --debug
```

### **Frontend Not Loading:**
```bash
# Check if dependencies are installed
npm list

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 **Development Workflow**

### **Daily Development:**
1. **Start development server**: `vercel dev`
2. **Make changes** to code
3. **Test locally** before committing
4. **Commit changes** to Git
5. **Deploy to Vercel** when ready

### **Testing Changes:**
1. **API changes**: Test with curl or Postman
2. **Frontend changes**: Test in browser
3. **Database changes**: Check API responses
4. **Authentication**: Test login/logout flow

---

## 📊 **Performance Tips**

### **Faster Development:**
- Use `vercel dev` for full-stack development
- Keep database connection alive
- Use browser dev tools for debugging
- Test API endpoints individually

### **Debugging:**
- Check Vercel dev server logs
- Use browser network tab
- Test API endpoints with curl
- Check database connection status

---

## 🚀 **Next Steps**

1. **Test everything locally** using this guide
2. **Fix any issues** found during testing
3. **Make your changes** to the codebase
4. **Test changes locally** before deploying
5. **Deploy to Vercel** when ready

---

## 📞 **Need Help?**

If you encounter issues:
1. Check the console logs
2. Verify environment variables
3. Test API endpoints individually
4. Check network tab in browser dev tools
5. Refer to troubleshooting section above

---

**Last Updated**: September 2025  
**Status**: ✅ **READY FOR LOCAL DEVELOPMENT** - Complete setup guide provided
