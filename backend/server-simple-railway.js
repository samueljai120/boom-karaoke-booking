import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

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

console.log('🚀 Starting Simple Boom Booking Backend on Railway');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// CORS middleware - must be before other middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
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
  origin: true,
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

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'Simple Railway health check - server is running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    message: 'Simple Railway API health check - server is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Boom Booking Backend is running (Simple Mode)',
    timestamp: new Date().toISOString()
  });
});

// Mock API endpoints for testing
app.get('/api/business-hours', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        day_of_week: 1,
        open_time: "09:00",
        close_time: "22:00",
        is_closed: false
      },
      {
        day_of_week: 2,
        open_time: "09:00",
        close_time: "22:00",
        is_closed: false
      },
      {
        day_of_week: 3,
        open_time: "09:00",
        close_time: "22:00",
        is_closed: false
      },
      {
        day_of_week: 4,
        open_time: "09:00",
        close_time: "22:00",
        is_closed: false
      },
      {
        day_of_week: 5,
        open_time: "09:00",
        close_time: "22:00",
        is_closed: false
      },
      {
        day_of_week: 6,
        open_time: "09:00",
        close_time: "23:00",
        is_closed: false
      },
      {
        day_of_week: 0,
        open_time: "10:00",
        close_time: "22:00",
        is_closed: false
      }
    ]
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'admin'
    }
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple Boom Booking Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS: Enabled for all origins`);
  console.log(`✅ Ready to accept requests`);
});

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