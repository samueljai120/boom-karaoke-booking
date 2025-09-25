import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🎤 Starting Boom Karaoke Booking System');
console.log('=======================================');
console.log(`🚀 Server starting on port ${PORT}`);
console.log(`📍 Server will be available at: http://0.0.0.0:${PORT}`);
console.log('🔑 Demo credentials: demo@example.com / demo123');
console.log('');

// Health check endpoints (must come before the catch-all route)
app.get('/health', (req, res) => {
  console.log('Health check requested at /health');
  res.status(200).json({ 
    status: 'OK', 
    message: 'Boom Karaoke Booking System is running',
    timestamp: new Date().toISOString()
  });
});

// Root health check endpoint for Railway compatibility
app.get('/', (req, res) => {
  // Check if this is a health check request
  if (req.headers['user-agent'] && req.headers['user-agent'].includes('healthcheck')) {
    console.log('Health check requested at root');
    return res.status(200).json({ 
      status: 'OK', 
      message: 'Boom Karaoke Booking System is running',
      timestamp: new Date().toISOString()
    });
  }
  
  // For regular requests, serve the React app
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing by serving index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen on all interfaces (IPv4 and IPv6) for Railway compatibility
app.listen(PORT, '::', () => {
  console.log('✅ Application ready!');
  console.log(`🌐 Server listening on http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`🏥 Root health check available at http://0.0.0.0:${PORT}/`);
});
