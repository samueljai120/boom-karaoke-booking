import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/postgres.js';

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const { category, is_active } = req.query;
    
    let query = 'SELECT * FROM rooms WHERE tenant_id = $1';
    const params = [req.tenant_id || '5ba3b120-e288-450d-97f2-cfc236e0894f']; // Default tenant for now
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get room by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
    if (err) {
      // console.error('Error fetching room:', err);
      return res.status(500).json({ error: 'Failed to fetch room' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ success: true, data: row });
  });
});

// Create new room
router.post('/', [
  body('name').isLength({ min: 1 }).trim(),
  body('capacity').isInt({ min: 1 }),
  body('category').isLength({ min: 1 }).trim(),
  body('price_per_hour').isFloat({ min: 0 }).optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, capacity, category, description, price_per_hour } = req.body;

  db.run(
    'INSERT INTO rooms (name, capacity, category, description, price_per_hour) VALUES (?, ?, ?, ?, ?)',
    [name, capacity, category, description || null, price_per_hour || 0],
    function(err) {
      if (err) {
        // console.error('Error creating room:', err);
        return res.status(500).json({ error: 'Failed to create room' });
      }

      res.status(201).json({
        success: true,
        data: {
          id: this.lastID,
          name,
          capacity,
          category,
          description,
          price_per_hour: price_per_hour || 0,
          is_active: 1
        }
      });
    }
  );
});

// Update room
router.put('/:id', [
  body('name').isLength({ min: 1 }).trim().optional(),
  body('capacity').isInt({ min: 1 }).optional(),
  body('category').isLength({ min: 1 }).trim().optional(),
  body('price_per_hour').isFloat({ min: 0 }).optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updates = req.body;
  
  // Build dynamic update query
  const updateFields = [];
  const values = [];

  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      updateFields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const query = `UPDATE rooms SET ${updateFields.join(', ')} WHERE id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      // console.error('Error updating room:', err);
      return res.status(500).json({ error: 'Failed to update room' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Fetch updated room
    db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
      if (err) {
        // console.error('Error fetching updated room:', err);
        return res.status(500).json({ error: 'Failed to fetch updated room' });
      }

      res.json({ success: true, data: row });
    });
  });
});

// Delete room
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Check if room has active bookings
  db.get(
    'SELECT COUNT(*) as count FROM bookings WHERE room_id = ? AND status != "cancelled"',
    [id],
    (err, row) => {
      if (err) {
        // console.error('Error checking room bookings:', err);
        return res.status(500).json({ error: 'Failed to check room bookings' });
      }

      if (row.count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete room with active bookings' 
        });
      }

      // Soft delete (set is_active to false)
      db.run(
        'UPDATE rooms SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            // console.error('Error deleting room:', err);
            return res.status(500).json({ error: 'Failed to delete room' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Room not found' });
          }

          res.json({ success: true, message: 'Room deleted successfully' });
        }
      );
    }
  );
});

// Get room categories
router.get('/categories/list', (req, res) => {
  db.all(
    'SELECT DISTINCT category FROM rooms WHERE is_active = 1 ORDER BY category',
    [],
    (err, rows) => {
      if (err) {
        // console.error('Error fetching categories:', err);
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }

      const categories = rows.map(row => row.category);
      res.json({ success: true, data: categories });
    }
  );
});

export default router;

