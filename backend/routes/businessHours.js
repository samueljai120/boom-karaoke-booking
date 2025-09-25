import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/postgres.js';

const router = express.Router();

// Get business hours
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM business_hours WHERE tenant_id = $1 ORDER BY day_of_week',
      [req.tenant_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching business hours:', error);
    res.status(500).json({ error: 'Failed to fetch business hours' });
  }
});

// Update business hours
router.put('/', [
  body('hours').isArray(),
  body('hours.*.day_of_week').isInt({ min: 0, max: 6 }),
  body('hours.*.open_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('hours.*.close_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('hours.*.is_closed').isBoolean().optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { hours } = req.body;

  // Validate that we have exactly 7 days (0-6)
  if (!Array.isArray(hours) || hours.length !== 7) {
    return res.status(400).json({ error: 'Must provide exactly 7 days of business hours' });
  }

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Clear existing hours
    db.run('DELETE FROM business_hours', (err) => {
      if (err) {
        // console.error('Error clearing business hours:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to update business hours' });
      }

      // Insert new hours
      let completed = 0;
      let hasError = false;

      hours.forEach((day, index) => {
        db.run(
          'INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?)',
          [day.day_of_week, day.open_time, day.close_time, day.is_closed || false],
          (err) => {
            if (err && !hasError) {
              hasError = true;
              // console.error('Error inserting business hours:', err);
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to update business hours' });
            }

            completed++;
            if (completed === hours.length && !hasError) {
              db.run('COMMIT', (err) => {
                if (err) {
                  // console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'Failed to update business hours' });
                }

                // Fetch updated hours
                db.all(
                  'SELECT * FROM business_hours ORDER BY day_of_week',
                  [],
                  (err, rows) => {
                    if (err) {
                      // console.error('Error fetching updated business hours:', err);
                      return res.status(500).json({ error: 'Failed to fetch updated business hours' });
                    }

                    res.json({ success: true, data: rows });
                  }
                );
              });
            }
          }
        );
      });
    });
  });
});

// Get business hours for specific day
router.get('/:day', (req, res) => {
  const { day } = req.params;
  const dayOfWeek = parseInt(day);

  if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return res.status(400).json({ error: 'Invalid day of week. Must be 0-6' });
  }

  db.get(
    'SELECT * FROM business_hours WHERE day_of_week = ?',
    [dayOfWeek],
    (err, row) => {
      if (err) {
        // console.error('Error fetching business hours for day:', err);
        return res.status(500).json({ error: 'Failed to fetch business hours' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Business hours not found for this day' });
      }

      res.json({ success: true, data: row });
    }
  );
});

// Update business hours for specific day
router.put('/:day', [
  body('open_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('close_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('is_closed').isBoolean().optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { day } = req.params;
  const dayOfWeek = parseInt(day);

  if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return res.status(400).json({ error: 'Invalid day of week. Must be 0-6' });
  }

  const { open_time, close_time, is_closed } = req.body;

  db.run(
    'UPDATE business_hours SET open_time = ?, close_time = ?, is_closed = ?, updated_at = CURRENT_TIMESTAMP WHERE day_of_week = ?',
    [open_time, close_time, is_closed || false, dayOfWeek],
    function(err) {
      if (err) {
        // console.error('Error updating business hours:', err);
        return res.status(500).json({ error: 'Failed to update business hours' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Business hours not found for this day' });
      }

      // Fetch updated hours
      db.get(
        'SELECT * FROM business_hours WHERE day_of_week = ?',
        [dayOfWeek],
        (err, row) => {
          if (err) {
            // console.error('Error fetching updated business hours:', err);
            return res.status(500).json({ error: 'Failed to fetch updated business hours' });
          }

          res.json({ success: true, data: row });
        }
      );
    }
  );
});

export default router;

