import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';

const router = express.Router();

// Get all settings
router.get('/', (req, res) => {
  db.all('SELECT * FROM settings ORDER BY key', (err, rows) => {
    if (err) {
      console.error('Error fetching settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    // Convert array of key-value pairs to object
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({ success: true, data: settings });
  });
});

// Get specific setting
router.get('/:key', (req, res) => {
  const { key } = req.params;

  db.get('SELECT * FROM settings WHERE key = ?', [key], (err, row) => {
    if (err) {
      console.error('Error fetching setting:', err);
      return res.status(500).json({ error: 'Failed to fetch setting' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ success: true, data: { key: row.key, value: row.value } });
  });
});

// Update settings (bulk update)
router.put('/', [
  body().isObject().withMessage('Settings must be an object')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const settings = req.body;
  const updates = [];
  const values = [];

  // Prepare update statements
  Object.entries(settings).forEach(([key, value]) => {
    updates.push('key = ?');
    values.push(key, value);
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No settings provided' });
  }

  // Use a transaction to update all settings
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [key, value],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });

    Promise.all(updatePromises)
      .then(() => {
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing settings update:', err);
            return res.status(500).json({ error: 'Failed to update settings' });
          }
          res.json({ success: true, message: 'Settings updated successfully' });
        });
      })
      .catch((err) => {
        console.error('Error updating settings:', err);
        db.run('ROLLBACK');
        res.status(500).json({ error: 'Failed to update settings' });
      });
  });
});

// Update specific setting
router.put('/:key', [
  body('value').notEmpty().withMessage('Value is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { key } = req.params;
  const { value } = req.body;

  db.run(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    [key, value],
    function(err) {
      if (err) {
        console.error('Error updating setting:', err);
        return res.status(500).json({ error: 'Failed to update setting' });
      }

      res.json({ success: true, message: 'Setting updated successfully' });
    }
  );
});

// Delete setting
router.delete('/:key', (req, res) => {
  const { key } = req.params;

  db.run('DELETE FROM settings WHERE key = ?', [key], function(err) {
    if (err) {
      console.error('Error deleting setting:', err);
      return res.status(500).json({ error: 'Failed to delete setting' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ success: true, message: 'Setting deleted successfully' });
  });
});

export default router;
