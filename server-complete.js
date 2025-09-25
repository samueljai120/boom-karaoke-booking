// Complete Development Server
// This server handles both frontend and API routes for local development

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

// Serve a simple frontend if dist doesn't exist
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Boom Karaoke Booking - Local Development</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
            }
            .header {
                margin-bottom: 40px;
            }
            .status {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
            }
            .api-test {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
            }
            .btn {
                background: #4CAF50;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin: 5px;
                text-decoration: none;
                display: inline-block;
            }
            .btn:hover {
                background: #45a049;
            }
            .response {
                background: rgba(0, 0, 0, 0.3);
                padding: 15px;
                border-radius: 5px;
                margin: 10px 0;
                text-align: left;
                font-family: monospace;
                white-space: pre-wrap;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎤 Boom Karaoke Booking</h1>
                <p>Local Development Server</p>
            </div>
            
            <div class="status">
                <h2>✅ Server Status</h2>
                <p>API Server is running successfully!</p>
                <p>Database: Connected to Neon PostgreSQL</p>
                <p>Environment: Development</p>
            </div>
            
            <div class="api-test">
                <h2>🧪 API Testing</h2>
                <p>Test the API endpoints:</p>
                <button class="btn" onclick="testHealth()">Test Health Check</button>
                <button class="btn" onclick="testRooms()">Test Rooms API</button>
                <button class="btn" onclick="testBusinessHours()">Test Business Hours</button>
                <button class="btn" onclick="testLogin()">Test Login</button>
                <div id="response" class="response" style="display: none;"></div>
            </div>
            
            <div class="api-test">
                <h2>📚 Available Endpoints</h2>
                <ul style="text-align: left;">
                    <li><strong>GET /api/health</strong> - Health check</li>
                    <li><strong>GET /api/rooms</strong> - Get all rooms</li>
                    <li><strong>GET /api/business-hours</strong> - Get business hours</li>
                    <li><strong>POST /api/auth/login</strong> - User login</li>
                    <li><strong>GET /api/auth/me</strong> - Get user info (requires token)</li>
                </ul>
            </div>
            
            <div class="api-test">
                <h2>🔑 Demo Credentials</h2>
                <p>Email: <code>demo@example.com</code></p>
                <p>Password: <code>demo123</code></p>
            </div>
        </div>
        
        <script>
            async function testHealth() {
                try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    showResponse('Health Check', data);
                } catch (error) {
                    showResponse('Health Check Error', { error: error.message });
                }
            }
            
            async function testRooms() {
                try {
                    const response = await fetch('/api/rooms');
                    const data = await response.json();
                    showResponse('Rooms API', data);
                } catch (error) {
                    showResponse('Rooms API Error', { error: error.message });
                }
            }
            
            async function testBusinessHours() {
                try {
                    const response = await fetch('/api/business-hours');
                    const data = await response.json();
                    showResponse('Business Hours API', data);
                } catch (error) {
                    showResponse('Business Hours API Error', { error: error.message });
                }
            }
            
            async function testLogin() {
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: 'demo@example.com',
                            password: 'demo123'
                        })
                    });
                    const data = await response.json();
                    showResponse('Login API', data);
                } catch (error) {
                    showResponse('Login API Error', { error: error.message });
                }
            }
            
            function showResponse(title, data) {
                const responseDiv = document.getElementById('response');
                responseDiv.style.display = 'block';
                responseDiv.innerHTML = \`<strong>\${title}:</strong>\\n\${JSON.stringify(data, null, 2)}\`;
            }
        </script>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Complete development server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`\n🎯 Test the application:`);
  console.log(`   - Open browser: http://localhost:${PORT}`);
  console.log(`   - Test API endpoints using the interface`);
  console.log(`   - Login with: demo@example.com / demo123`);
});
