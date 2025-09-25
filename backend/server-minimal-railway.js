import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - bulletproof
const allowedOrigins = [
  'https://boom-booking-frontend.vercel.app',
  'https://boom-booking.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// Add CORS_ORIGIN from environment if set
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

console.log('🚀 Starting Minimal Railway Server');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 CORS Origin:', process.env.CORS_ORIGIN || 'not set');
console.log('🌐 Allowed Origins:', allowedOrigins);

// CORS middleware - must be first
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // Allow localhost in development
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Additional CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'Minimal Railway server is running',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    cors_origin: process.env.CORS_ORIGIN || 'not set'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'API health check - server is running',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    cors_origin: process.env.CORS_ORIGIN || 'not set'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Boom Booking Backend API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    cors_origin: process.env.CORS_ORIGIN || 'not set',
    allowed_origins: allowedOrigins
  });
});

// Business hours endpoint
app.get('/api/business-hours', (req, res) => {
  res.json({
    success: true,
    data: {
      businessHours: [
        { day: 'monday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'tuesday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'wednesday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'thursday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'friday', open: '09:00', close: '23:00', isOpen: true },
        { day: 'saturday', open: '10:00', close: '23:00', isOpen: true },
        { day: 'sunday', open: '10:00', close: '21:00', isOpen: true }
      ]
    }
  });
});

// Rooms endpoint
app.get('/api/rooms', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Room A', capacity: 4, category: 'Standard', isActive: true },
      { id: 2, name: 'Room B', capacity: 6, category: 'Premium', isActive: true },
      { id: 3, name: 'Room C', capacity: 8, category: 'VIP', isActive: true }
    ]
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple demo login
  if (email === 'demo@example.com' && password === 'demo123') {
    res.json({
      success: true,
      token: 'demo-token-123',
      user: {
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  // Simple session check
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'admin'
      }
    }
  });
});

// Catch-all for non-API routes
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'This is a backend API. Frontend is deployed separately.',
    requestedPath: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal Railway server running on port ${PORT}`);
  console.log(`🔌 API Base URL: http://0.0.0.0:${PORT}/api`);
  console.log(`🏥 Health Check: http://0.0.0.0:${PORT}/health`);
  console.log(`✅ Ready to accept requests`);
  console.log(`🌐 Allowed CORS Origins: ${allowedOrigins.join(', ')}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});