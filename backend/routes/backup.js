import express from 'express';
import { pool } from '../database/postgres.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateTenant } from '../middleware/subdomain.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply tenant validation to all backup routes
// But allow both subdomain and header-based tenant resolution
router.use((req, res, next) => {
  // If no tenant from subdomain middleware, try to get from tenant context middleware
  if (!req.tenant && req.tenant_id) {
    req.tenant = { id: req.tenant_id, status: 'active' };
  }
  
  if (!req.tenant) {
    return res.status(400).json({
      error: 'No tenant context',
      message: 'This endpoint requires a valid tenant subdomain or tenant ID header'
    });
  }
  
  if (req.tenant.status !== 'active') {
    return res.status(403).json({
      error: 'Tenant inactive',
      message: 'This tenant account is not active',
      status: req.tenant.status
    });
  }
  
  next();
});

// Get backup history
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenant_id;

    const query = `
      SELECT 
        id,
        backup_name,
        backup_type,
        file_size,
        status,
        created_at,
        completed_at
      FROM tenant_backups 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [tenantId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching backup history:', error);
    res.status(500).json({ error: 'Failed to fetch backup history' });
  }
});

// Create new backup
router.post('/', async (req, res) => {
  try {
    const { backup_name, backup_type = 'full' } = req.body;
    const tenantId = req.tenant_id;

    if (!backup_name || backup_name.trim().length === 0) {
      return res.status(400).json({ error: 'Backup name is required' });
    }

    // Create backup record
    const backupQuery = `
      INSERT INTO tenant_backups (
        tenant_id, 
        backup_name, 
        backup_type, 
        status, 
        created_at
      ) 
      VALUES ($1, $2, $3, 'pending', NOW())
      RETURNING *
    `;

    const backupResult = await pool.query(backupQuery, [tenantId, backup_name, backup_type]);
    const backupId = backupResult.rows[0].id;

    // Start backup process asynchronously
    performBackup(tenantId, backupId, backup_type)
      .catch(error => {
        console.error('Backup failed:', error);
        // Update backup status to failed
        pool.query(
          'UPDATE tenant_backups SET status = $1, error_message = $2 WHERE id = $3',
          ['failed', error.message, backupId]
        );
      });

    res.status(201).json({
      success: true,
      data: backupResult.rows[0],
      message: 'Backup process started. Check backup status for progress.'
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Perform backup process
async function performBackup(tenantId, backupId, backupType) {
  try {
    // Update status to in progress
    await pool.query(
      'UPDATE tenant_backups SET status = $1 WHERE id = $2',
      ['in_progress', backupId]
    );

    // Create backup directory
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${tenantId}-${timestamp}.json`;
    const filePath = path.join(backupDir, fileName);

    // Get tenant data
    const tenantData = await exportTenantData(tenantId);

    // Write backup file
    fs.writeFileSync(filePath, JSON.stringify(tenantData, null, 2));

    // Get file size
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Update backup record
    await pool.query(
      `UPDATE tenant_backups 
       SET status = $1, file_path = $2, file_size = $3, completed_at = NOW()
       WHERE id = $4`,
      ['completed', filePath, fileSize, backupId]
    );

    console.log(`Backup completed for tenant ${tenantId}: ${filePath}`);
  } catch (error) {
    console.error('Backup process failed:', error);
    throw error;
  }
}

// Export tenant data
async function exportTenantData(tenantId) {
  const exportData = {
    tenant_id: tenantId,
    export_date: new Date().toISOString(),
    version: '1.0'
  };

  // Export tenant information
  const tenantQuery = await pool.query(
    'SELECT * FROM tenants WHERE id = $1',
    [tenantId]
  );
  exportData.tenant = tenantQuery.rows[0];

  // Export rooms
  const roomsQuery = await pool.query(
    'SELECT * FROM rooms WHERE tenant_id = $1',
    [tenantId]
  );
  exportData.rooms = roomsQuery.rows;

  // Export bookings
  const bookingsQuery = await pool.query(
    'SELECT * FROM bookings WHERE tenant_id = $1',
    [tenantId]
  );
  exportData.bookings = bookingsQuery.rows;

  // Export business hours
  const businessHoursQuery = await pool.query(
    'SELECT * FROM business_hours WHERE tenant_id = $1',
    [tenantId]
  );
  exportData.business_hours = businessHoursQuery.rows;

  // Export settings
  const settingsQuery = await pool.query(
    'SELECT * FROM settings WHERE tenant_id = $1',
    [tenantId]
  );
  exportData.settings = settingsQuery.rows;

  // Export tenant users
  const tenantUsersQuery = await pool.query(
    'SELECT * FROM tenant_users WHERE tenant_id = $1',
    [tenantId]
  );
  exportData.tenant_users = tenantUsersQuery.rows;

  // Export audit logs (last 1000 entries)
  const auditLogsQuery = await pool.query(
    'SELECT * FROM audit_logs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1000',
    [tenantId]
  );
  exportData.audit_logs = auditLogsQuery.rows;

  return exportData;
}

// Download backup file
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant_id;

    const query = `
      SELECT file_path, backup_name, created_at
      FROM tenant_backups 
      WHERE id = $1 AND tenant_id = $2 AND status = 'completed'
    `;

    const result = await pool.query(query, [id, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Backup not found or not completed' });
    }

    const backup = result.rows[0];

    if (!fs.existsSync(backup.file_path)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    const fileName = `${backup.backup_name}_${new Date(backup.created_at).toISOString().split('T')[0]}.json`;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/json');
    
    const fileStream = fs.createReadStream(backup.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
});

// Restore from backup
router.post('/restore', async (req, res) => {
  try {
    const { backup_id, confirm = false } = req.body;
    const tenantId = req.tenant_id;

    if (!confirm) {
      return res.status(400).json({ 
        error: 'Restore confirmation required',
        message: 'This action will overwrite existing data. Set confirm=true to proceed.'
      });
    }

    if (!backup_id) {
      return res.status(400).json({ error: 'Backup ID is required' });
    }

    // Get backup record
    const backupQuery = `
      SELECT file_path, backup_name
      FROM tenant_backups 
      WHERE id = $1 AND tenant_id = $2 AND status = 'completed'
    `;

    const backupResult = await pool.query(backupQuery, [backup_id, tenantId]);

    if (backupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Backup not found or not completed' });
    }

    const backup = backupResult.rows[0];

    if (!fs.existsSync(backup.file_path)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    // Read backup data
    const backupData = JSON.parse(fs.readFileSync(backup.file_path, 'utf8'));

    // Start restore process
    await performRestore(tenantId, backupData);

    res.json({
      success: true,
      message: 'Data restored successfully from backup'
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Perform restore process
async function performRestore(tenantId, backupData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Clear existing data (except tenant record)
    await client.query('DELETE FROM audit_logs WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM settings WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM business_hours WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM bookings WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM rooms WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM tenant_users WHERE tenant_id = $1', [tenantId]);

    // Restore rooms
    if (backupData.rooms) {
      for (const room of backupData.rooms) {
        await client.query(`
          INSERT INTO rooms (
            id, tenant_id, name, capacity, category, description, 
            price_per_hour, is_active, settings, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          room.id, room.tenant_id, room.name, room.capacity, room.category,
          room.description, room.price_per_hour, room.is_active, 
          JSON.stringify(room.settings || {}), room.created_at, room.updated_at
        ]);
      }
    }

    // Restore bookings
    if (backupData.bookings) {
      for (const booking of backupData.bookings) {
        await client.query(`
          INSERT INTO bookings (
            id, tenant_id, room_id, customer_name, customer_email, customer_phone,
            start_time, end_time, status, notes, total_price, metadata, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          booking.id, booking.tenant_id, booking.room_id, booking.customer_name,
          booking.customer_email, booking.customer_phone, booking.start_time,
          booking.end_time, booking.status, booking.notes, booking.total_price,
          JSON.stringify(booking.metadata || {}), booking.created_at, booking.updated_at
        ]);
      }
    }

    // Restore business hours
    if (backupData.business_hours) {
      for (const hours of backupData.business_hours) {
        await client.query(`
          INSERT INTO business_hours (
            id, tenant_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          hours.id, hours.tenant_id, hours.day_of_week, hours.open_time,
          hours.close_time, hours.is_closed, hours.created_at, hours.updated_at
        ]);
      }
    }

    // Restore settings
    if (backupData.settings) {
      for (const setting of backupData.settings) {
        await client.query(`
          INSERT INTO settings (
            id, tenant_id, key, value, type, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          setting.id, setting.tenant_id, setting.key, setting.value,
          setting.type, setting.created_at, setting.updated_at
        ]);
      }
    }

    // Restore tenant users
    if (backupData.tenant_users) {
      for (const tenantUser of backupData.tenant_users) {
        await client.query(`
          INSERT INTO tenant_users (
            id, tenant_id, user_id, role, permissions, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          tenantUser.id, tenantUser.tenant_id, tenantUser.user_id,
          tenantUser.role, JSON.stringify(tenantUser.permissions || {}),
          tenantUser.created_at, tenantUser.updated_at
        ]);
      }
    }

    await client.query('COMMIT');
    console.log(`Restore completed for tenant ${tenantId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Delete backup
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant_id;

    // Get backup record
    const backupQuery = `
      SELECT file_path
      FROM tenant_backups 
      WHERE id = $1 AND tenant_id = $2
    `;

    const backupResult = await pool.query(backupQuery, [id, tenantId]);

    if (backupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const backup = backupResult.rows[0];

    // Delete backup record
    await pool.query(
      'DELETE FROM tenant_backups WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    // Delete backup file if it exists
    if (backup.file_path && fs.existsSync(backup.file_path)) {
      fs.unlinkSync(backup.file_path);
    }

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Get backup status
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant_id;

    const query = `
      SELECT 
        id,
        backup_name,
        backup_type,
        status,
        error_message,
        created_at,
        completed_at
      FROM tenant_backups 
      WHERE id = $1 AND tenant_id = $2
    `;

    const result = await pool.query(query, [id, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching backup status:', error);
    res.status(500).json({ error: 'Failed to fetch backup status' });
  }
});

export default router;
