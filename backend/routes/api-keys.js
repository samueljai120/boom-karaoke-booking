import express from 'express';
import { pool } from '../database/postgres.js';
import crypto from 'crypto';
import { validateTenant } from '../middleware/subdomain.js';

const router = express.Router();

// Apply tenant validation to all API key routes
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

// Get all API keys for tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenant_id;

    const query = `
      SELECT 
        id,
        name,
        key_prefix,
        permissions,
        last_used_at,
        usage_count,
        is_active,
        created_at,
        expires_at
      FROM api_keys 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [tenantId]);

    // Mask the actual keys for security
    const maskedKeys = result.rows.map(key => ({
      ...key,
      masked_key: `${key.key_prefix}***${key.id.slice(-4)}`
    }));

    res.json({
      success: true,
      data: maskedKeys
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Create new API key
router.post('/', async (req, res) => {
  try {
    const { name, permissions = {}, expires_in_days = null } = req.body;
    const tenantId = req.tenant_id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    // Generate API key
    const keyPrefix = `bk_${crypto.randomBytes(8).toString('hex')}`;
    const keySuffix = crypto.randomBytes(16).toString('hex');
    const fullKey = `${keyPrefix}_${keySuffix}`;

    // Set expiration date
    let expiresAt = null;
    if (expires_in_days && expires_in_days > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in_days);
    }

    // Create API key record
    const query = `
      INSERT INTO api_keys (
        tenant_id, 
        name, 
        key_hash, 
        key_prefix,
        permissions, 
        is_active, 
        created_at,
        expires_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING *
    `;

    // Hash the key for storage
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

    const result = await pool.query(query, [
      tenantId,
      name,
      keyHash,
      keyPrefix,
      JSON.stringify(permissions),
      true,
      expiresAt
    ]);

    // Return the full key only once during creation
    res.status(201).json({
      success: true,
      data: {
        ...result.rows[0],
        api_key: fullKey // Only returned on creation
      },
      message: 'API key created successfully. Please save it securely as it will not be shown again.'
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// Update API key
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, is_active } = req.body;
    const tenantId = req.tenant_id;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (permissions !== undefined) {
      updates.push(`permissions = $${paramIndex}`);
      values.push(JSON.stringify(permissions));
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(tenantId, id);

    const query = `
      UPDATE api_keys 
      SET ${updates.join(', ')}
      WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'API key updated successfully'
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// Delete API key
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant_id;

    const result = await pool.query(
      'DELETE FROM api_keys WHERE tenant_id = $1 AND id = $2 RETURNING *',
      [tenantId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// Regenerate API key
router.post('/:id/regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant_id;

    // Get existing API key
    const existingKey = await pool.query(
      'SELECT * FROM api_keys WHERE tenant_id = $1 AND id = $2',
      [tenantId, id]
    );

    if (existingKey.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Generate new key
    const keyPrefix = existingKey.rows[0].key_prefix;
    const keySuffix = crypto.randomBytes(16).toString('hex');
    const fullKey = `${keyPrefix}_${keySuffix}`;

    // Hash the new key
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

    // Update the key
    const result = await pool.query(
      'UPDATE api_keys SET key_hash = $1, updated_at = NOW() WHERE tenant_id = $2 AND id = $3 RETURNING *',
      [keyHash, tenantId, id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        api_key: fullKey // Only returned on regeneration
      },
      message: 'API key regenerated successfully. Please save it securely as it will not be shown again.'
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
});

// Get API key usage statistics
router.get('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30days' } = req.query;
    const tenantId = req.tenant_id;

    const dateRange = getDateRange(period);

    // Get usage statistics
    const query = `
      SELECT 
        COUNT(*) as total_calls,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        AVG(CASE WHEN created_at >= $3 THEN 1 ELSE 0 END) as avg_daily_calls
      FROM audit_logs 
      WHERE tenant_id = $1 
        AND resource_type = 'api_usage'
        AND metadata->>'api_key_id' = $2
        AND created_at >= $3
        AND created_at <= $4
    `;

    const result = await pool.query(query, [tenantId, id, dateRange.start, dateRange.end]);

    // Get recent usage by endpoint
    const endpointQuery = `
      SELECT 
        action as endpoint,
        COUNT(*) as calls
      FROM audit_logs 
      WHERE tenant_id = $1 
        AND resource_type = 'api_usage'
        AND metadata->>'api_key_id' = $2
        AND created_at >= $3
        AND created_at <= $4
      GROUP BY action
      ORDER BY calls DESC
      LIMIT 10
    `;

    const endpointResult = await pool.query(endpointQuery, [tenantId, id, dateRange.start, dateRange.end]);

    res.json({
      success: true,
      data: {
        period,
        date_range: dateRange,
        usage: result.rows[0],
        top_endpoints: endpointResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching API key usage:', error);
    res.status(500).json({ error: 'Failed to fetch API key usage' });
  }
});

// Validate API key middleware
export async function validateApiKey(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'API key required' });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Find the API key
    const result = await pool.query(
      'SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = true',
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const apiKeyData = result.rows[0];

    // Check expiration
    if (apiKeyData.expires_at && new Date() > new Date(apiKeyData.expires_at)) {
      return res.status(401).json({ error: 'API key has expired' });
    }

    // Set tenant context from API key
    req.tenant_id = apiKeyData.tenant_id;
    req.api_key = apiKeyData;

    // Update usage statistics
    await pool.query(
      `UPDATE api_keys 
       SET last_used_at = NOW(), usage_count = usage_count + 1 
       WHERE id = $1`,
      [apiKeyData.id]
    );

    // Log API usage
    await pool.query(
      `INSERT INTO audit_logs (tenant_id, action, resource_type, metadata, created_at)
       VALUES ($1, $2, 'api_usage', $3, NOW())`,
      [
        apiKeyData.tenant_id,
        `${req.method} ${req.path}`,
        JSON.stringify({
          api_key_id: apiKeyData.id,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        })
      ]
    );

    next();
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to get date range
function getDateRange(period) {
  const now = new Date();
  let start;

  switch (period) {
    case '7days':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90days':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { start, end: now };
}

export default router;
