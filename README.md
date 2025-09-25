# 🎤 Boom Karaoke Booking System - Frontend

> **Modern React application for karaoke room booking and management**

[![React](https://img.shields.io/badge/React-18.0+-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0+-purple?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18.0 or higher
- npm or yarn package manager

### **Installation**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# OR use Vercel CLI for production-like environment
vercel dev
```

### **Access the Application**
- **Development**: http://localhost:3000
- **Vercel Dev**: http://localhost:3000 (with API routes)

## 📁 **Project Structure**

```
Boom-Booking-Isolate/
├── src/                          # Source code
│   ├── components/               # Reusable UI components
│   │   ├── calendar/             # Calendar components
│   │   ├── booking/              # Booking components
│   │   ├── auth/                 # Authentication components
│   │   └── ui/                   # Base UI components
│   ├── pages/                    # Application pages
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Login.jsx             # Login page
│   │   ├── Booking.jsx           # Booking page
│   │   └── Rooms.jsx             # Rooms page
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.js            # Authentication hook
│   │   ├── useBooking.js         # Booking management hook
│   │   └── useCalendar.js        # Calendar functionality hook
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.jsx       # Authentication context
│   │   └── BookingContext.jsx    # Booking context
│   ├── utils/                    # Utility functions
│   │   ├── apiConfig.js          # API configuration
│   │   ├── auth.js               # Authentication utilities
│   │   └── helpers.js            # General helpers
│   └── styles/                   # CSS and styling
│       ├── globals.css           # Global styles
│       └── components.css        # Component styles
├── api/                          # Vercel API routes
│   ├── auth/                     # Authentication endpoints
│   │   ├── login.js              # Login endpoint
│   │   └── me.js                 # User info endpoint
│   ├── business-hours.js         # Business hours API
│   ├── rooms.js                  # Rooms API
│   └── health.js                 # Health check API
├── lib/                          # Shared libraries
│   ├── neon-db.js                # Database connection
│   └── db.js                     # Database utilities
├── public/                       # Static assets
│   ├── images/                   # Image assets
│   ├── icons/                    # Icon assets
│   └── favicon.ico               # Favicon
├── docs/                         # Documentation
│   ├── deployment/               # Deployment guides
│   ├── troubleshooting/          # Fix guides
│   └── development/              # Development guides
├── config/                       # Configuration files
│   ├── vercel.json              # Vercel configuration
│   └── package.json              # Dependencies
└── dist/                         # Build output
```

## 🎯 **Features**

### **🎤 Core Features**
- **Room Booking** - Easy room selection and time slot booking
- **Real-time Calendar** - Live availability updates
- **User Authentication** - Secure login and registration
- **Responsive Design** - Works on all devices
- **Booking Management** - View and modify bookings

### **🔧 Technical Features**
- **Vite Build System** - Fast development and building
- **React 18** - Latest React features and performance
- **Context API** - State management without external libraries
- **Custom Hooks** - Reusable logic and state
- **API Integration** - RESTful API communication
- **Error Handling** - Comprehensive error management

## 🛠️ **Development**

### **Available Scripts**
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues

# Vercel
vercel dev               # Start Vercel development server
vercel build             # Build for Vercel
vercel deploy            # Deploy to Vercel
```

### **Environment Variables**
Create a `.env.local` file:
```env
# API Configuration
VITE_API_BASE_URL=/api
VITE_WS_URL=

# App Configuration
VITE_APP_NAME=Boom Karaoke Booking
VITE_APP_VERSION=1.0.0
```

### **API Endpoints**
The application uses Vercel API routes for backend functionality:

- **Health Check**: `GET /api/health`
- **Business Hours**: `GET /api/business-hours`
- **Rooms**: `GET /api/rooms`
- **Login**: `POST /api/auth/login`
- **User Info**: `GET /api/auth/me`

## 🎨 **UI Components**

### **Calendar Components**
- `CalendarGrid` - Main calendar display
- `TimeSlot` - Individual time slot
- `BookingModal` - Booking form modal
- `RoomSelector` - Room selection component

### **Authentication Components**
- `LoginForm` - User login form
- `RegisterForm` - User registration form
- `AuthGuard` - Route protection component

### **Booking Components**
- `BookingCard` - Booking display card
- `BookingForm` - Booking creation form
- `BookingList` - List of user bookings

## 🔧 **Configuration**

### **Vite Configuration**
The project uses Vite for fast development and building. Configuration is in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

### **Vercel Configuration**
Vercel configuration is in `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm ci && npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## 🧪 **Testing**

### **Local Testing**
```bash
# Start development server
npm run dev

# Test in browser
open http://localhost:3000

# Test API endpoints
curl http://localhost:3000/api/health
```

### **Manual Testing Checklist**
- [ ] Page loads without errors
- [ ] Login form works with demo credentials
- [ ] Calendar displays correctly
- [ ] Room selection works
- [ ] Booking flow completes
- [ ] Responsive design works on mobile
- [ ] No console errors

## 🚀 **Deployment**

### **Vercel Deployment**
1. **Connect Repository** - Link to Vercel
2. **Configure Build** - Set build command and output directory
3. **Add Environment Variables** - Configure production settings
4. **Deploy** - Automatic deployment on push

### **Manual Build**
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

## 📚 **Documentation**

### **Component Documentation**
- Each component has JSDoc comments
- Props and usage examples included
- Type definitions for TypeScript support

### **API Documentation**
- All API endpoints documented
- Request/response examples provided
- Error handling documented

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **API Connection Issues**
- Check `VITE_API_BASE_URL` environment variable
- Verify API routes are properly configured
- Check browser network tab for errors

#### **Authentication Issues**
- Verify JWT secret is configured
- Check token expiration settings
- Clear browser storage and retry

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=true npm run dev
```

## 🤝 **Contributing**

### **Code Style**
- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Add JSDoc comments for complex functions

### **Git Workflow**
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with descriptive message
5. Push and create pull request

## 📄 **License**

This project is licensed under the MIT License.

---

**Built with ❤️ using React and Vite**

*Last updated: September 2024*