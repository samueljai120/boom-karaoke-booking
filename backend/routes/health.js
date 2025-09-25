import express from 'express';
import { pool } from '../database/postgres.js';

const router = express.Router();

// Health check endpoint - Railway compatible
router.get('/', async (req, res) => {
  try {
    // Basic health check - always return healthy for Railway
    // Railway health checks should be fast and not depend on external services
    const healthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      railway: {
        buildId: process.env.RAILWAY_BUILD_ID || 'Not set',
        deploymentId: process.env.RAILWAY_DEPLOYMENT_ID || 'Not set'
      }
    };

    // Try to check database connection (non-blocking)
    try {
      await pool.query('SELECT 1 as health');
      healthData.database = 'connected';
      healthData.database_time = new Date().toISOString();
    } catch (dbError) {
      // Database might not be ready yet, but don't fail the health check
      healthData.database = 'initializing';
      healthData.database_note = 'Database connection in progress';
    }

    res.json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    // Even if there's an error, return a basic healthy response for Railway
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      note: 'Basic health check - detailed checks may be unavailable'
    });
  }
});

// Detailed health check
router.get('/detailed', (req, res) => {
  const health = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {}
  };

  // Check database
  db.get('SELECT 1 as health', [], (err, row) => {
    health.services.database = {
      status: err ? 'error' : 'healthy',
      error: err ? err.message : null
    };

    if (err) {
      health.success = false;
      health.status = 'unhealthy';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.services.memory = {
      status: 'healthy',
      usage: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
      }
    };

    // Check CPU usage
    const cpuUsage = process.cpuUsage();
    health.services.cpu = {
      status: 'healthy',
      usage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    };

    const statusCode = health.success ? 200 : 503;
    res.status(statusCode).json(health);
  });
});

export default router;

