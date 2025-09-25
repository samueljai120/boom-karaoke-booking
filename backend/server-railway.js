import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import businessHoursRoutes from './routes/businessHours.js';
import roomsRoutes from './routes/rooms.js';
import bookingsRoutes from './routes/bookings.js';
import settingsRoutes from './routes/settings.js';
import migrationRoutes from './routes/migration.js';

// Import database initialization
import { pool, testConnection } from './database/postgres.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - production ready
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

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Railway-specific logging
console.log('🚀 Starting Boom Booking Backend on Railway');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 CORS Origin:', process.env.CORS_ORIGIN || '*');
console.log('🌐 Allowed CORS Origins:', allowedOrigins);

// CORS middleware - must be before other middleware
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
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost
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
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set('io', io);

// Simple health check for Railway (before database initialization)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'Railway health check - server is running',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    cors_origin: process.env.CORS_ORIGIN || 'not set'
  });
});

// Additional health check endpoint for Railway
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
    status: 'ok', 
    message: 'Boom Booking Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/business-hours', businessHoursRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/migration', migrationRoutes);

// Basic business hours endpoint (fallback)
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

// Basic rooms endpoint (fallback)
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

// Basic bookings endpoint (fallback)
app.get('/api/bookings', (req, res) => {
  res.json({
    success: true,
    data: {
      bookings: []
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Boom Karaoke Booking API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    railway: {
      buildId: process.env.RAILWAY_BUILD_ID || 'Not set',
      deploymentId: process.env.RAILWAY_DEPLOYMENT_ID || 'Not set'
    },
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      login: '/api/auth/login',
      register: '/api/auth/register'
    }
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'Connected' : 'Not connected'
  });
});

// Catch-all for non-API routes
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'This is a backend API. Frontend is deployed separately.',
    requestedPath: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Emergency database initialization with comprehensive fixes
async function initDatabase() {
  try {
    console.log('🚨 EMERGENCY DATABASE INITIALIZATION STARTING...');
    
    // Test connection with timeout
    const connectionPromise = testConnection();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    // 1. Create users table if it doesn't exist
    console.log('📋 Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 2. Check if role column exists and add it if missing (migration)
    console.log('🔧 Checking for missing role column...');
    const roleColumnExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (roleColumnExists.rows.length === 0) {
      console.log('❌ Role column missing! Adding it...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user'
      `);
      console.log('✅ Role column added successfully');
    } else {
      console.log('✅ Role column already exists');
    }
    
    // 3. Update existing users with default role
    console.log('🔄 Updating existing users...');
    const updateResult = await pool.query(`
      UPDATE users 
      SET role = 'user' 
      WHERE role IS NULL OR role = ''
    `);
    console.log(`✅ Updated ${updateResult.rowCount} users with default role`);
    
    // 4. Create rooms table if it doesn't exist
    console.log('🏠 Creating rooms table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        name VARCHAR(255) NOT NULL,
        capacity INTEGER NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT,
        price_per_hour DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 4.1 Check if tenant_id column exists and handle it
    console.log('🔧 Checking for tenant_id column...');
    const tenantIdColumnExists = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'rooms' AND column_name = 'tenant_id'
    `);
    
    if (tenantIdColumnExists.rows.length > 0) {
      console.log('✅ tenant_id column exists - using existing schema');
      // Make tenant_id nullable if it's not already
      try {
        await pool.query(`
          ALTER TABLE rooms 
          ALTER COLUMN tenant_id DROP NOT NULL
        `);
        console.log('✅ Made tenant_id nullable');
      } catch (error) {
        console.log('ℹ️ tenant_id already nullable or error:', error.message);
      }
    } else {
      console.log('ℹ️ No tenant_id column - using simple schema');
    }
    
    // 5. Create bookings table if it doesn't exist
    console.log('📅 Creating bookings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        notes TEXT,
        total_price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms (id)
      )
    `);
    
    // 6. Insert default rooms if they don't exist
    console.log('🏠 Setting up default rooms...');
    const roomCount = await pool.query('SELECT COUNT(*) as count FROM rooms');
    if (roomCount.rows[0].count === '0') {
      const rooms = [
        ['Room A', 4, 'Standard', 'Standard karaoke room for small groups', 25.00],
        ['Room B', 6, 'Premium', 'Premium room with better sound system', 35.00],
        ['Room C', 8, 'VIP', 'VIP room with luxury amenities', 50.00]
      ];
      
      for (const room of rooms) {
        // Check if tenant_id column exists to determine insert query
        const hasTenantId = tenantIdColumnExists.rows.length > 0;
        
        if (hasTenantId) {
          // Insert with NULL tenant_id (for global/default rooms)
          await pool.query(`
            INSERT INTO rooms (tenant_id, name, capacity, category, description, price_per_hour)
            VALUES (NULL, $1, $2, $3, $4, $5)
          `, room);
        } else {
          // Insert without tenant_id
          await pool.query(`
            INSERT INTO rooms (name, capacity, category, description, price_per_hour)
            VALUES ($1, $2, $3, $4, $5)
          `, room);
        }
      }
      console.log('✅ Default rooms created successfully');
    } else {
      console.log('✅ Rooms already exist');
    }
    
    // 7. Insert demo user if not exists
    console.log('👤 Setting up demo user...');
    const demoUserExists = await pool.query('SELECT id FROM users WHERE email = $1', ['demo@example.com']);
    if (demoUserExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      
      await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        ['demo@example.com', hashedPassword, 'Demo User', 'admin']
      );
      console.log('✅ Demo user created successfully');
    } else {
      console.log('✅ Demo user already exists');
    }
    
    // 8. Final verification
    console.log('🔍 Final verification...');
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const finalRoomCount = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const bookingCount = await pool.query('SELECT COUNT(*) as count FROM bookings');
    
    console.log('📊 Database Summary:');
    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Rooms: ${finalRoomCount.rows[0].count}`);
    console.log(`   - Bookings: ${bookingCount.rows[0].count}`);
    
    console.log('🎉 EMERGENCY DATABASE INITIALIZATION COMPLETED SUCCESSFULLY!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('🔍 Error details:', error.message);
    console.error('🔍 Error stack:', error.stack);
    console.log('🔄 Continuing without database - using fallback mode');
    console.log('⚠️ Some features may not work properly without database');
    return false;
  }
}

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Boom Karaoke Backend API...');
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Port: ${PORT}`);
    console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
    console.log(`🏗️ Railway Build: ${process.env.RAILWAY_BUILD_ID ? 'Yes' : 'No'}`);
    console.log(`🚀 Railway Deployment: ${process.env.RAILWAY_DEPLOYMENT_ID ? 'Yes' : 'No'}`);
    
    // Initialize database (non-blocking)
    const dbInitialized = await initDatabase();
    
    if (dbInitialized) {
      console.log('✅ Database connection established');
    } else {
      console.log('⚠️ Database connection failed - API will work with limited functionality');
    }
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Boom Karaoke Backend API running on port ${PORT}`);
      console.log(`🔌 API Base URL: http://0.0.0.0:${PORT}/api`);
      console.log(`🏥 Health Check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`🌐 Socket.IO: http://0.0.0.0:${PORT}`);
      console.log(`✅ Ready to accept requests`);
      console.log(`🎯 This is a BACKEND API server, not a frontend!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('🔍 Error details:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('🔍 Error details:', error.message);
  console.error('🔍 Error stack:', error.stack);
  console.log('🔄 Attempting graceful shutdown...');
  server.close(() => {
    console.log('✅ Server closed due to uncaught exception');
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('🔄 Attempting graceful shutdown...');
  server.close(() => {
    console.log('✅ Server closed due to unhandled rejection');
    process.exit(1);
  });
});

startServer();
