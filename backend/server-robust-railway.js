import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
const { Pool } = pkg;

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Database connection with robust error handling
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  console.log('✅ Database pool created successfully');
} catch (error) {
  console.error('❌ Database pool creation failed:', error.message);
  process.exit(1);
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Railway-specific logging
console.log('🚀 Starting Boom Booking Backend on Railway');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 CORS Origin:', process.env.CORS_ORIGIN || '*');
console.log('🗄️ Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Database initialization with comprehensive error handling
async function initDatabase() {
  let client;
  try {
    console.log('🔍 Testing database connection...');
    client = await pool.connect();
    console.log('✅ Database connection established');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database query test successful:', result.rows[0].current_time);
    
    // Create users table with proper error handling
    console.log('📋 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');
    
    // Create demo user with proper error handling
    console.log('👤 Setting up demo user...');
    const demoCheck = await client.query('SELECT * FROM users WHERE email = $1', ['demo@example.com']);
    
    if (demoCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      await client.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        ['demo@example.com', hashedPassword, 'Demo User', 'admin']
      );
      console.log('✅ Demo user created');
    } else {
      console.log('✅ Demo user already exists');
    }
    
    client.release();
    console.log('✅ Database initialization completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('❌ Error details:', error);
    if (client) {
      client.release();
    }
    return false;
  }
}

// Health check endpoint with detailed status
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const client = await pool.connect();
    const dbResult = await client.query('SELECT NOW() as current_time');
    client.release();
    
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      database_time: dbResult.rows[0].current_time
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Registration endpoint with comprehensive error handling
app.post('/api/auth/register', async (req, res) => {
  let client;
  try {
    const { name, email, password } = req.body;
    
    console.log('📝 Registration attempt:', { name, email });
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Get database connection
    client = await pool.connect();
    
    // Check if user already exists
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await client.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, 'user']
    );
    
    const user = result.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    client.release();
    console.log('✅ User registered successfully:', email);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: token
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    if (client) {
      client.release();
    }
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
});

// Login endpoint with comprehensive error handling
app.post('/api/auth/login', async (req, res) => {
  let client;
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Get database connection
    client = await pool.connect();
    
    // Find user by email
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      client.release();
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      client.release();
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    client.release();
    console.log('✅ User logged in successfully:', email);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: token
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    if (client) {
      client.release();
    }
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

// Basic business hours endpoint
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

// Basic rooms endpoint
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

// Basic bookings endpoint
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
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      login: '/api/auth/login',
      register: '/api/auth/register',
      businessHours: '/api/business-hours',
      rooms: '/api/rooms',
      bookings: '/api/bookings'
    }
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      console.log('⚠️ Database initialization failed, but server will continue');
    }
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Boom Karaoke Backend API running on port', PORT);
      console.log('🔌 API Base URL: http://0.0.0.0:' + PORT + '/api');
      console.log('🏥 Health Check: http://0.0.0.0:' + PORT + '/api/health');
      console.log('🌐 Socket.IO: http://0.0.0.0:' + PORT);
      console.log('✅ Ready to accept requests');
      console.log('🎯 This is a BACKEND API server, not a frontend!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
