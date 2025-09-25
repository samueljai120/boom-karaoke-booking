import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';

const router = express.Router();

// Get push notification settings
router.get('/settings', (req, res) => {
  db.get('SELECT * FROM settings WHERE key = ?', ['push_notifications'], (err, row) => {
    if (err) {
      console.error('Error fetching push notification settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    const defaultSettings = {
      enabled: true,
      bookingConfirmations: true,
      bookingReminders: true,
      bookingCancellations: true,
      systemUpdates: false,
      marketing: false,
      desktop: true,
      mobile: true,
      email: true,
      sound: true,
      vibration: true,
      quietHours: false,
      quietStart: '22:00',
      quietEnd: '08:00',
      timezone: 'UTC'
    };

    const settings = row ? JSON.parse(row.value) : defaultSettings;
    res.json({ success: true, data: settings });
  });
});

// Update push notification settings
router.put('/settings', [
  body().isObject().withMessage('Settings must be an object')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const settings = req.body;

  db.run(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    ['push_notifications', JSON.stringify(settings)],
    function(err) {
      if (err) {
        console.error('Error updating push notification settings:', err);
        return res.status(500).json({ error: 'Failed to update settings' });
      }

      res.json({ success: true, message: 'Push notification settings updated successfully' });
    }
  );
});

// Send test notification
router.post('/test', [
  body('type').isIn(['desktop', 'mobile', 'email']).withMessage('Type must be desktop, mobile, or email'),
  body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, message } = req.body;

  // Simulate sending notification
  setTimeout(() => {
    res.json({
      success: true,
      message: `${type} notification sent successfully`,
      data: {
        type,
        message,
        timestamp: new Date().toISOString(),
        status: 'delivered'
      }
    });
  }, 1000);
});

// Get notification statistics
router.get('/stats', (req, res) => {
  // Simulate notification statistics
  const stats = {
    notificationsSentToday: 1247,
    deliveryRate: 98.5,
    averageDeliveryTime: 2.3,
    userEngagement: 89,
    totalSubscribers: 2847,
    activeSubscriptions: 2156
  };

  res.json({ success: true, data: stats });
});

// Send notification to user
router.post('/send', [
  body('userId').isInt().withMessage('User ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').isIn(['info', 'warning', 'success', 'error']).withMessage('Type must be info, warning, success, or error')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, title, message, type, data } = req.body;

  // Store notification in database
  db.run(
    'INSERT INTO notifications (user_id, title, message, type, data, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [userId, title, message, type, JSON.stringify(data || {})],
    function(err) {
      if (err) {
        console.error('Error storing notification:', err);
        return res.status(500).json({ error: 'Failed to send notification' });
      }

      res.json({
        success: true,
        message: 'Notification sent successfully',
        notificationId: this.lastID
      });
    }
  );
});

// Get user notifications
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset],
    (err, rows) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }

      res.json({ success: true, data: rows });
    }
  );
});

// Mark notification as read
router.put('/:notificationId/read', (req, res) => {
  const { notificationId } = req.params;

  db.run(
    'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ?',
    [notificationId],
    function(err) {
      if (err) {
        console.error('Error marking notification as read:', err);
        return res.status(500).json({ error: 'Failed to mark notification as read' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ success: true, message: 'Notification marked as read' });
    }
  );
});

export default router;
