// Frontend Development Server
// This server serves the actual React frontend with API integration

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(express.json());

// Serve static files from dist folder
app.use(express.static(join(__dirname, 'dist')));

// Database connection
const sql = neon(process.env.DATABASE_URL);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-this-now-local-dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await sql`SELECT 1`;
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      message: 'Local development server is running',
      environment: process.env.NODE_ENV || 'development',
      platform: 'local',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      database: 'disconnected'
    });
  }
});

// Business hours
app.get('/api/business-hours', async (req, res) => {
  try {
    const hours = await sql`
      SELECT day_of_week as "dayOfWeek", 
             open_time as "openTime", 
             close_time as "closeTime", 
             is_closed as "isClosed"
      FROM business_hours 
      ORDER BY day_of_week
    `;
    
    res.json({
      success: true,
      data: hours
    });
  } catch (error) {
    console.error('Business hours error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business hours'
    });
  }
});

// Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await sql`
      SELECT id, name, capacity, category, description, 
             price_per_hour as "pricePerHour", 
             is_active as "isActive"
      FROM rooms 
      WHERE is_active = true
      ORDER BY name
    `;
    
    // Transform data for frontend compatibility
    const transformedRooms = rooms.map(room => ({
      ...room,
      _id: room.id,
      hourlyRate: parseFloat(room.pricePerHour),
      status: room.isActive ? 'active' : 'inactive',
      isBookable: room.isActive
    }));
    
    res.json({
      success: true,
      data: transformedRooms
    });
  } catch (error) {
    console.error('Rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms'
    });
  }
});

// Authentication - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user in database
    const users = await sql`
      SELECT id, email, password, name, role 
      FROM users 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
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
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Authentication - Get user info
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const users = await sql`
        SELECT id, email, name, role 
        FROM users 
        WHERE id = ${decoded.id}
      `;
      
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      const user = users[0];
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// Serve React app for all other routes (SPA routing)
app.get('/*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`📱 React App: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`\n🎯 The actual Boom Karaoke Booking landing page is now available!`);
  console.log(`   - Open browser: http://localhost:${PORT}`);
  console.log(`   - Login with: demo@example.com / demo123`);
});
