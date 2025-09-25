import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/postgres.js';
import { tenantContext, setDatabaseTenantContext } from '../middleware/tenant.js';

const router = express.Router();

// Apply tenant context middleware
router.use(tenantContext);
router.use(setDatabaseTenantContext);

// Get all tenants (admin only)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.subdomain,
        t.domain,
        t.plan_type,
        t.status,
        t.settings,
        t.created_at,
        t.updated_at,
        COUNT(tu.user_id) as user_count,
        COUNT(r.id) as room_count,
        COUNT(b.id) as booking_count
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      LEFT JOIN rooms r ON t.id = r.tenant_id
      LEFT JOIN bookings b ON t.id = b.tenant_id
      WHERE t.status != 'deleted'
      GROUP BY t.id, t.name, t.subdomain, t.domain, t.plan_type, t.status, t.settings, t.created_at, t.updated_at
      ORDER BY t.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get tenant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        t.*,
        COUNT(tu.user_id) as user_count,
        COUNT(r.id) as room_count,
        COUNT(b.id) as booking_count
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      LEFT JOIN rooms r ON t.id = r.tenant_id
      LEFT JOIN bookings b ON t.id = b.tenant_id
      WHERE t.id = $1 AND t.status != 'deleted'
      GROUP BY t.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

// Create new tenant
router.post('/', [
  body('name').isLength({ min: 2, max: 255 }).trim(),
  body('subdomain').isLength({ min: 2, max: 100 }).matches(/^[a-z0-9-]+$/),
  body('plan_type').optional().isIn(['free', 'basic', 'pro', 'business']),
  body('domain').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, subdomain, domain, plan_type = 'basic' } = req.body;
    
    // Check if subdomain is already taken
    const existingTenant = await pool.query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );
    
    if (existingTenant.rows.length > 0) {
      return res.status(409).json({ error: 'Subdomain already taken' });
    }
    
    // Create tenant
    const result = await pool.query(`
      INSERT INTO tenants (name, subdomain, domain, plan_type, status, settings)
      VALUES ($1, $2, $3, $4, 'active', '{}')
      RETURNING *
    `, [name, subdomain, domain, plan_type]);
    
    const tenant = result.rows[0];
    
    // Create default settings for the tenant
    const defaultSettings = [
      ['app_name', name, 'string'],
      ['timezone', 'America/New_York', 'string'],
      ['currency', 'USD', 'string'],
      ['booking_advance_days', '30', 'number'],
      ['booking_min_duration', '60', 'number'],
      ['booking_max_duration', '480', 'number']
    ];
    
    for (const [key, value, type] of defaultSettings) {
      await pool.query(`
        INSERT INTO settings (tenant_id, key, value, type)
        VALUES ($1, $2, $3, $4)
      `, [tenant.id, key, value, type]);
    }
    
    // Create default business hours
    for (let day = 0; day < 7; day++) {
      await pool.query(`
        INSERT INTO business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
        VALUES ($1, $2, '10:00', '22:00', false)
      `, [tenant.id, day]);
    }
    
    res.status(201).json({
      success: true,
      data: tenant,
      message: 'Tenant created successfully'
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Update tenant
router.put('/:id', [
  body('name').optional().isLength({ min: 2, max: 255 }).trim(),
  body('subdomain').optional().isLength({ min: 2, max: 100 }).matches(/^[a-z0-9-]+$/),
  body('plan_type').optional().isIn(['free', 'basic', 'pro', 'business']),
  body('status').optional().isIn(['active', 'inactive', 'suspended']),
  body('domain').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { name, subdomain, domain, plan_type, status, settings } = req.body;
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }
    
    if (subdomain !== undefined) {
      // Check if subdomain is already taken by another tenant
      const existingTenant = await pool.query(
        'SELECT id FROM tenants WHERE subdomain = $1 AND id != $2',
        [subdomain, id]
      );
      
      if (existingTenant.rows.length > 0) {
        return res.status(409).json({ error: 'Subdomain already taken' });
      }
      
      updates.push(`subdomain = $${paramIndex}`);
      params.push(subdomain);
      paramIndex++;
    }
    
    if (domain !== undefined) {
      updates.push(`domain = $${paramIndex}`);
      params.push(domain);
      paramIndex++;
    }
    
    if (plan_type !== undefined) {
      updates.push(`plan_type = $${paramIndex}`);
      params.push(plan_type);
      paramIndex++;
    }
    
    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (settings !== undefined) {
      updates.push(`settings = $${paramIndex}`);
      params.push(JSON.stringify(settings));
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push(`updated_at = NOW()`);
    params.push(id);
    
    const result = await pool.query(`
      UPDATE tenants 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND status != 'deleted'
      RETURNING *
    `, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Tenant updated successfully'
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// Delete tenant (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE tenants 
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1 AND status != 'deleted'
      RETURNING id, name, subdomain
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json({
      success: true,
      message: 'Tenant deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// Get tenant statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT tu.user_id) as total_users,
        COUNT(DISTINCT r.id) as total_rooms,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.created_at >= NOW() - INTERVAL '30 days' THEN b.id END) as bookings_last_30_days,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'cancelled' THEN b.id END) as cancelled_bookings,
        COALESCE(SUM(b.total_price), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN b.created_at >= NOW() - INTERVAL '30 days' THEN b.total_price ELSE 0 END), 0) as revenue_last_30_days
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      LEFT JOIN rooms r ON t.id = r.tenant_id
      LEFT JOIN bookings b ON t.id = b.tenant_id
      WHERE t.id = $1 AND t.status != 'deleted'
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching tenant stats:', error);
    res.status(500).json({ error: 'Failed to fetch tenant statistics' });
  }
});

export default router;
