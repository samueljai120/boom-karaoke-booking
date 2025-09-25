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
import roomsRoutes from './routes/rooms.js';
import bookingsRoutes from './routes/bookings.js';
import businessHoursRoutes from './routes/businessHours.js';
import settingsRoutes from './routes/settings.js';
import healthRoutes from './routes/health.js';
import tenantRoutes from './routes/tenants.js';
import analyticsRoutes from './routes/analytics.js';
import billingRoutes from './routes/billing.js';
import apiKeysRoutes from './routes/api-keys.js';
import backupRoutes from './routes/backup.js';
import formsRoutes from './routes/forms.js';

// Import database initialization
import { initMultiTenantDatabase, createDefaultTenant, testConnection } from './database/postgres.js';

// Import middleware
import { tenantContext } from './middleware/tenant.js';
import { subdomainRouter, resolveTenant, validateTenant, trackUsage } from './middleware/subdomain.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../dist')));

// Apply subdomain routing middleware
app.use(subdomainRouter);
app.use(resolveTenant);
app.use(trackUsage);

// Apply tenant context middleware to all API routes
app.use('/api', tenantContext);

// Tenant-specific API Routes (require valid tenant)
app.use('/api/auth', validateTenant, authRoutes);
app.use('/api/rooms', validateTenant, roomsRoutes);
app.use('/api/bookings', validateTenant, bookingsRoutes);
app.use('/api/business-hours', validateTenant, businessHoursRoutes);
app.use('/api/settings', validateTenant, settingsRoutes);

// Tenant-specific routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/api-keys', apiKeysRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/forms', formsRoutes);

// Global API Routes (no tenant required)
app.use('/api/health', healthRoutes);
app.use('/api/tenants', tenantRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  // console.log (removed for clean version)('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    // console.log (removed for clean version)('Client disconnected:', socket.id);
  });
  
  // Join room for booking updates
  socket.on('join-room', (roomId) => {
    socket.join(`room-${roomId}`);
  });
  
  // Leave room
  socket.on('leave-room', (roomId) => {
    socket.leave(`room-${roomId}`);
  });
});

// Make io available to routes
app.set('io', io);

// API-only mode - don't serve frontend files
app.get('/', (req, res) => {
  res.json({
    message: 'Boom Karaoke Booking API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      bookings: '/api/bookings',
      rooms: '/api/rooms'
    }
  });
});

// Catch-all for non-API routes
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'This is a backend API. Frontend is deployed separately.'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Error logging removed for clean version
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test PostgreSQL connection
    await testConnection();
    
    // Initialize multi-tenant database schema
    await initMultiTenantDatabase();
    
    // Create default tenant and data
    await createDefaultTenant();
    
    console.log('✅ PostgreSQL database initialized successfully');
    
    server.listen(PORT, () => {
      console.log(`🚀 Boom Karaoke Backend API running on port ${PORT}`);
      console.log(`🔌 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Socket.IO: http://localhost:${PORT}`);
      console.log(`✅ Ready to accept requests`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

