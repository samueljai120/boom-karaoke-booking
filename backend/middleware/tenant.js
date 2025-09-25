import { pool } from '../database/postgres.js';

// Tenant context middleware
export function tenantContext(req, res, next) {
  // Extract tenant information from various sources
  const tenantId = extractTenantId(req);
  
  if (tenantId) {
    req.tenant_id = tenantId;
    req.tenant_context = {
      id: tenantId,
      // Additional tenant context can be added here
    };
  } else {
    // Default to demo tenant for now
    req.tenant_id = '5ba3b120-e288-450d-97f2-cfc236e0894f';
    req.tenant_context = {
      id: req.tenant_id,
      name: 'Demo Karaoke',
      subdomain: 'demo'
    };
  }
  
  next();
}

// Extract tenant ID from various sources
function extractTenantId(req) {
  // 1. From subdomain (e.g., demo.boom-booking.com)
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];
  
  if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
    // For now, return null and use default tenant
    return null;
  }
  
  // 2. From query parameter (e.g., ?tenant=tenant-id)
  if (req.query.tenant) {
    return req.query.tenant;
  }
  
  // 3. From header
  if (req.headers['x-tenant-id']) {
    return req.headers['x-tenant-id'];
  }
  
  // 4. From JWT token (if user is authenticated)
  if (req.user && req.user.tenant_id) {
    return req.user.tenant_id;
  }
  
  return null;
}

// Get tenant ID by subdomain
async function getTenantIdBySubdomain(subdomain) {
  try {
    const result = await pool.query(
      'SELECT id FROM tenants WHERE subdomain = $1 AND status = $2',
      [subdomain, 'active']
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
  } catch (error) {
    console.error('Error getting tenant by subdomain:', error);
  }
  
  return null;
}

// Set tenant context for database queries
export async function setTenantContext(client, tenantId) {
  try {
    await client.query('SELECT set_config($1, $2, false)', [
      'app.current_tenant_id',
      tenantId
    ]);
  } catch (error) {
    console.error('Error setting tenant context:', error);
    throw error;
  }
}

// Middleware to set tenant context in database
export function setDatabaseTenantContext(req, res, next) {
  if (req.tenant_id) {
    // Set tenant context for this request
    req.setTenantContext = (client) => setTenantContext(client, req.tenant_id);
  }
  next();
}
