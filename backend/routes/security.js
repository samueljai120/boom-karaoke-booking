import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { db } from '../database/init.js';

const router = express.Router();

// Get security settings
router.get('/settings', (req, res) => {
  db.get('SELECT * FROM settings WHERE key = ?', ['security_settings'], (err, row) => {
    if (err) {
      console.error('Error fetching security settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    const defaultSettings = {
      twoFactorAuth: false,
      passwordExpiry: 90,
      sessionTimeout: 30,
      ipWhitelist: [],
      dataRetention: 365,
      gdprCompliance: true,
      dataEncryption: true,
      auditLogging: true,
      privacyMode: false,
      dataExport: true,
      dataDeletion: true
    };

    const settings = row ? JSON.parse(row.value) : defaultSettings;
    res.json({ success: true, data: settings });
  });
});

// Update security settings
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
    ['security_settings', JSON.stringify(settings)],
    function(err) {
      if (err) {
        console.error('Error updating security settings:', err);
        return res.status(500).json({ error: 'Failed to update settings' });
      }

      res.json({ success: true, message: 'Security settings updated successfully' });
    }
  );
});

// Change password
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('userId').isInt().withMessage('User ID is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword, userId } = req.body;

  // Get current user
  db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, userId],
      function(err) {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ error: 'Failed to update password' });
        }

        res.json({ success: true, message: 'Password updated successfully' });
      }
    );
  });
});

// Get security score
router.get('/score', (req, res) => {
  db.get('SELECT * FROM settings WHERE key = ?', ['security_settings'], (err, row) => {
    if (err) {
      console.error('Error fetching security settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    const defaultSettings = {
      twoFactorAuth: false,
      dataEncryption: true,
      auditLogging: true,
      gdprCompliance: true,
      ipWhitelist: [],
      passwordExpiry: 90,
      sessionTimeout: 30
    };

    const settings = row ? JSON.parse(row.value) : defaultSettings;

    // Calculate security score
    let score = 0;
    if (settings.twoFactorAuth) score += 25;
    if (settings.dataEncryption) score += 20;
    if (settings.auditLogging) score += 15;
    if (settings.gdprCompliance) score += 15;
    if (settings.ipWhitelist && settings.ipWhitelist.length > 0) score += 10;
    if (settings.passwordExpiry <= 90) score += 10;
    if (settings.sessionTimeout <= 30) score += 5;

    score = Math.min(score, 100);

    res.json({ success: true, data: { score } });
  });
});

// Get recent security activity
router.get('/activity', (req, res) => {
  const { limit = 20 } = req.query;

  db.all(
    'SELECT * FROM security_activity ORDER BY created_at DESC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) {
        console.error('Error fetching security activity:', err);
        return res.status(500).json({ error: 'Failed to fetch activity' });
      }

      res.json({ success: true, data: rows });
    }
  );
});

// Log security activity
router.post('/activity', [
  body('action').notEmpty().withMessage('Action is required'),
  body('userId').isInt().withMessage('User ID is required'),
  body('ipAddress').optional().isIP().withMessage('IP address must be valid'),
  body('userAgent').optional().isString().withMessage('User agent must be string')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { action, userId, ipAddress, userAgent, details } = req.body;

  db.run(
    'INSERT INTO security_activity (action, user_id, ip_address, user_agent, details, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [action, userId, ipAddress, userAgent, JSON.stringify(details || {})],
    function(err) {
      if (err) {
        console.error('Error logging security activity:', err);
        return res.status(500).json({ error: 'Failed to log activity' });
      }

      res.json({ success: true, message: 'Activity logged successfully' });
    }
  );
});

// Export user data
router.post('/export-data', [
  body('userId').isInt().withMessage('User ID is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.body;

  // Get all user data
  db.all(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, userRows) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return res.status(500).json({ error: 'Failed to export data' });
      }

      if (userRows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user bookings
      db.all(
        'SELECT * FROM bookings WHERE customer_email = ?',
        [userRows[0].email],
        (err, bookingRows) => {
          if (err) {
            console.error('Error fetching booking data:', err);
            return res.status(500).json({ error: 'Failed to export data' });
          }

          const exportData = {
            user: userRows[0],
            bookings: bookingRows,
            exportedAt: new Date().toISOString(),
            format: 'JSON'
          };

          res.json({ success: true, data: exportData });
        }
      );
    }
  );
});

// Request data deletion
router.post('/request-deletion', [
  body('userId').isInt().withMessage('User ID is required'),
  body('reason').optional().isString().withMessage('Reason must be string')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, reason } = req.body;

  // Log deletion request
  db.run(
    'INSERT INTO data_deletion_requests (user_id, reason, status, requested_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [userId, reason, 'pending'],
    function(err) {
      if (err) {
        console.error('Error creating deletion request:', err);
        return res.status(500).json({ error: 'Failed to create deletion request' });
      }

      res.json({
        success: true,
        message: 'Data deletion request submitted successfully',
        requestId: this.lastID
      });
    }
  );
});

export default router;
