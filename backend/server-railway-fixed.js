import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

console.log('🚀 Starting Boom Booking Backend on Railway');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 CORS Origin:', process.env.CORS_ORIGIN || '*');

// CORS middleware - must be before other middleware
app.use((req, res, next) => {
  const allowedOrigin = process.env.CORS_ORIGIN || 'https://boom-booking-frontend.vercel.app';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://boom-booking-frontend.vercel.app',
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

// Database connection
let db;
try {
  if (process.env.DATABASE_URL) {
    db = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('✅ Database connection pool created');
  } else {
    console.log('⚠️ No DATABASE_URL found, using mock data');
  }
} catch (error) {
  console.error('❌ Database connection error:', error.message);
  console.log('⚠️ Falling back to mock data');
}

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'Railway health check - server is running',
    database: db ? 'connected' : 'not connected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'Railway API health check - server is running',
    database: db ? 'connected' : 'not connected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Boom Booking Backend is running',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'not connected'
  });
});

// Business hours endpoint
app.get('/api/business-hours', async (req, res) => {
  try {
    if (db) {
      // Try to get from database
      const result = await db.query('SELECT * FROM business_hours ORDER BY day_of_week');
      if (result.rows.length > 0) {
        res.json({
          success: true,
          data: result.rows
        });
        return;
      }
    }
    
    // Fallback to mock data
    res.json({
      success: true,
      data: [
        { day_of_week: 1, open_time: "09:00", close_time: "22:00", is_closed: false },
        { day_of_week: 2, open_time: "09:00", close_time: "22:00", is_closed: false },
        { day_of_week: 3, open_time: "09:00", close_time: "22:00", is_closed: false },
        { day_of_week: 4, open_time: "09:00", close_time: "22:00", is_closed: false },
        { day_of_week: 5, open_time: "09:00", close_time: "22:00", is_closed: false },
        { day_of_week: 6, open_time: "09:00", close_time: "23:00", is_closed: false },
        { day_of_week: 0, open_time: "10:00", close_time: "22:00", is_closed: false }
      ]
    });
  } catch (error) {
    console.error('Business hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

// Auth endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    if (db) {
      // Try to get from database
      const result = await db.query('SELECT * FROM users LIMIT 1');
      if (result.rows.length > 0) {
        const user = result.rows[0];
        res.json({
          success: true,
          data: {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role || 'user'
          }
        });
        return;
      }
    }
    
    // Fallback to mock data
    res.json({
      success: true,
      data: {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Boom Booking Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS: Enabled for all origins`);
  console.log(`📊 Database: ${db ? 'Connected' : 'Not connected'}`);
  console.log(`✅ Ready to accept requests`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  if (db) {
    db.end();
  }
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  if (db) {
    db.end();
  }
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});
