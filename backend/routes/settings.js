import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/postgres.js';

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM settings WHERE tenant_id = $1 ORDER BY key',
      [req.tenant_id]
    );

    // Convert array of key-value pairs to object
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get specific setting
router.get('/:key', (req, res) => {
  const { key } = req.params;

  db.get(
    'SELECT * FROM settings WHERE key = ?',
    [key],
    (err, row) => {
      if (err) {
        // console.error('Error fetching setting:', err);
        return res.status(500).json({ error: 'Failed to fetch setting' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      res.json({ success: true, data: { key: row.key, value: row.value } });
    }
  );
});

// Update settings (bulk update)
router.put('/', [
  body().isObject()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const settings = req.body;
  const keys = Object.keys(settings);

  if (keys.length === 0) {
    return res.status(400).json({ error: 'No settings provided' });
  }

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let completed = 0;
    let hasError = false;

    keys.forEach(key => {
      db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, settings[key]],
        (err) => {
          if (err && !hasError) {
            hasError = true;
            // console.error('Error updating settings:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to update settings' });
          }

          completed++;
          if (completed === keys.length && !hasError) {
            db.run('COMMIT', (err) => {
              if (err) {
                // console.error('Error committing transaction:', err);
                return res.status(500).json({ error: 'Failed to update settings' });
              }

              res.json({ success: true, data: settings });
            });
          }
        }
      );
    });
  });
});

// Update specific setting
router.put('/:key', [
  body('value').notEmpty()
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
        // console.error('Error updating setting:', err);
        return res.status(500).json({ error: 'Failed to update setting' });
      }

      res.json({ 
        success: true, 
        data: { key, value },
        message: this.changes > 0 ? 'Setting updated' : 'Setting created'
      });
    }
  );
});

// Delete setting
router.delete('/:key', (req, res) => {
  const { key } = req.params;

  db.run(
    'DELETE FROM settings WHERE key = ?',
    [key],
    function(err) {
      if (err) {
        // console.error('Error deleting setting:', err);
        return res.status(500).json({ error: 'Failed to delete setting' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      res.json({ success: true, message: 'Setting deleted successfully' });
    }
  );
});

export default router;

