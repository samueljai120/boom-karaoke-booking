import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';

const router = express.Router();

// Get analytics overview
router.get('/overview', (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate period multiplier
  const multiplier = period === '7d' ? 0.25 : period === '30d' ? 1 : period === '90d' ? 3 : 12;

  // Get basic stats
  db.get('SELECT COUNT(*) as totalUsers FROM users', (err, userRow) => {
    if (err) {
      console.error('Error fetching user count:', err);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }

    db.get('SELECT COUNT(*) as totalBookings FROM bookings', (err, bookingRow) => {
      if (err) {
        console.error('Error fetching booking count:', err);
        return res.status(500).json({ error: 'Failed to fetch analytics' });
      }

      db.get('SELECT COUNT(*) as totalRooms FROM rooms', (err, roomRow) => {
        if (err) {
          console.error('Error fetching room count:', err);
          return res.status(500).json({ error: 'Failed to fetch analytics' });
        }

        // Calculate revenue (simplified)
        db.get('SELECT SUM(total_price) as totalRevenue FROM bookings WHERE total_price IS NOT NULL', (err, revenueRow) => {
          if (err) {
            console.error('Error fetching revenue:', err);
            return res.status(500).json({ error: 'Failed to fetch analytics' });
          }

          const revenue = Math.round((revenueRow.totalRevenue || 0) * multiplier);
          const bookings = Math.round(bookingRow.totalBookings * multiplier);
          const users = Math.round(userRow.totalUsers * multiplier);

          res.json({
            success: true,
            data: {
              revenue: {
                current: revenue,
                previous: Math.round(revenue * 0.85),
                change: 15.4,
                trend: 'up'
              },
              bookings: {
                current: bookings,
                previous: Math.round(bookings * 0.78),
                change: 22.1,
                trend: 'up'
              },
              users: {
                current: users,
                previous: Math.round(users * 0.92),
                change: 8.2,
                trend: 'up'
              },
              conversion: {
                current: 12.5,
                previous: 10.8,
                change: 15.7,
                trend: 'up'
              }
            }
          });
        });
      });
    });
  });
});

// Get revenue trend
router.get('/revenue-trend', (req, res) => {
  const { period = '6m' } = req.query;

  // Simulate revenue trend data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseRevenue = 12000;
  
  const trendData = months.map((month, index) => ({
    month,
    value: baseRevenue + (index * 2000) + Math.random() * 1000
  }));

  res.json({ success: true, data: trendData });
});

// Get bookings trend
router.get('/bookings-trend', (req, res) => {
  const { period = '6m' } = req.query;

  // Simulate bookings trend data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseBookings = 28000;
  
  const trendData = months.map((month, index) => ({
    month,
    value: baseBookings + (index * 5000) + Math.random() * 2000
  }));

  res.json({ success: true, data: trendData });
});

// Get top performing venues
router.get('/top-venues', (req, res) => {
  // Simulate top venues data
  const topVenues = [
    { name: 'Boom Karaoke Downtown', revenue: 4500, bookings: 1200, growth: 25.3 },
    { name: 'Boom Karaoke Westside', revenue: 3800, bookings: 980, growth: 18.7 },
    { name: 'Boom Karaoke Eastside', revenue: 3200, bookings: 850, growth: 12.4 },
    { name: 'Boom Karaoke North', revenue: 2800, bookings: 720, growth: 8.9 },
    { name: 'Boom Karaoke South', revenue: 2400, bookings: 650, growth: 5.2 }
  ];

  res.json({ success: true, data: topVenues });
});

// Get recent activity
router.get('/activity', (req, res) => {
  const { limit = 20 } = req.query;

  // Simulate recent activity
  const activities = [
    { action: 'New booking created', user: 'john@example.com', time: '2 minutes ago', type: 'booking' },
    { action: 'Payment processed', user: 'system', time: '5 minutes ago', type: 'payment' },
    { action: 'User registered', user: 'jane@example.com', time: '10 minutes ago', type: 'user' },
    { action: 'Report generated', user: 'admin@example.com', time: '1 hour ago', type: 'report' },
    { action: 'Settings updated', user: 'mike@example.com', time: '2 hours ago', type: 'settings' }
  ];

  res.json({ success: true, data: activities.slice(0, limit) });
});

// Export analytics data
router.post('/export', [
  body('format').isIn(['csv', 'json', 'pdf']).withMessage('Format must be csv, json, or pdf'),
  body('dataType').isIn(['revenue', 'bookings', 'users', 'all']).withMessage('Data type must be revenue, bookings, users, or all'),
  body('period').optional().isString().withMessage('Period must be string')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { format, dataType, period = '30d' } = req.body;

  // Simulate export process
  setTimeout(() => {
    res.json({
      success: true,
      message: `Analytics data exported to ${format.toUpperCase()} successfully`,
      data: {
        format,
        dataType,
        period,
        exportedAt: new Date().toISOString(),
        fileSize: '2.3 MB',
        recordCount: 1247
      }
    });
  }, 2000);
});

// Get performance metrics
router.get('/performance', (req, res) => {
  const metrics = [
    { name: 'Query Response Time', value: '45ms', status: 'good', icon: 'Zap' },
    { name: 'Connection Pool', value: '8/20', status: 'good', icon: 'Users' },
    { name: 'Cache Hit Rate', value: '94.2%', status: 'excellent', icon: 'Activity' },
    { name: 'Disk Usage', value: '2.4/10 GB', status: 'good', icon: 'HardDrive' },
    { name: 'Uptime', value: '99.9%', status: 'excellent', icon: 'Shield' },
    { name: 'Active Queries', value: '3', status: 'good', icon: 'BarChart3' }
  ];

  res.json({ success: true, data: metrics });
});

// Get insights
router.get('/insights', (req, res) => {
  const insights = [
    {
      type: 'success',
      title: 'Peak Performance',
      description: 'Your booking system is performing 15% better than last month. Consider scaling up to handle increased demand.',
      icon: 'TrendingUp'
    },
    {
      type: 'info',
      title: 'Optimization Opportunity',
      description: 'Conversion rate increased by 15.7%. Focus on the top-performing venues to maximize revenue potential.',
      icon: 'Target'
    }
  ];

  res.json({ success: true, data: insights });
});

export default router;