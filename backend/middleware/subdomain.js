import { pool } from '../database/postgres.js';

// Subdomain routing middleware
export function subdomainRouter(req, res, next) {
  const host = req.get('host') || '';
  const protocol = req.protocol;
  
  // Parse subdomain from host
  const hostParts = host.split('.');
  let subdomain = null;
  let domain = null;
  
  if (hostParts.length >= 3) {
    // e.g., demo.boom-booking.com or demo.localhost:5001
    subdomain = hostParts[0];
    domain = hostParts.slice(1).join('.');
  } else if (hostParts.length === 2 && hostParts[0] !== 'www') {
    // e.g., demo.localhost (development)
    subdomain = hostParts[0];
    domain = hostParts[1];
  }
  
  // Store subdomain info in request
  req.subdomain = subdomain;
  req.domain = domain;
  req.fullHost = host;
  req.baseUrl = `${protocol}://${host}`;
  
  next();
}

// Tenant resolution middleware
export async function resolveTenant(req, res, next) {
  if (!req.subdomain) {
    // No subdomain, use default tenant or redirect to main site
    req.tenant = null;
    return next();
  }
  
  try {
    // Look up tenant by subdomain
    const result = await pool.query(
      'SELECT * FROM tenants WHERE subdomain = $1 AND status = $2',
      [req.subdomain, 'active']
    );
    
    if (result.rows.length === 0) {
      // Tenant not found, return 404 or redirect
      return res.status(404).json({
        error: 'Tenant not found',
        subdomain: req.subdomain,
        message: 'This subdomain is not associated with any active tenant'
      });
    }
    
    req.tenant = result.rows[0];
    req.tenant_id = req.tenant.id;
    
    // Set tenant context for database queries
    req.setTenantContext = (client) => {
      return client.query('SELECT set_config($1, $2, false)', [
        'app.current_tenant_id',
        req.tenant_id
      ]);
    };
    
    next();
  } catch (error) {
    console.error('Error resolving tenant:', error);
    res.status(500).json({
      error: 'Failed to resolve tenant',
      message: 'Internal server error while looking up tenant'
    });
  }
}

// Tenant validation middleware
export function validateTenant(req, res, next) {
  if (!req.tenant) {
    return res.status(400).json({
      error: 'No tenant context',
      message: 'This endpoint requires a valid tenant subdomain'
    });
  }
  
  // Check if tenant is active
  if (req.tenant.status !== 'active') {
    return res.status(403).json({
      error: 'Tenant inactive',
      message: 'This tenant account is not active',
      status: req.tenant.status
    });
  }
  
  next();
}

// Plan-based access control middleware
export function checkPlanAccess(requiredPlan) {
  return (req, res, next) => {
    if (!req.tenant) {
      return res.status(400).json({ error: 'No tenant context' });
    }
    
    const planHierarchy = {
      'free': 0,
      'basic': 1,
      'pro': 2,
      'business': 3,
      'professional': 3
    };
    
    const tenantPlanLevel = planHierarchy[req.tenant.plan_type] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0;
    
    if (tenantPlanLevel < requiredPlanLevel) {
      return res.status(403).json({
        error: 'Plan upgrade required',
        message: `This feature requires a ${requiredPlan} plan or higher`,
        currentPlan: req.tenant.plan_type,
        requiredPlan: requiredPlan
      });
    }
    
    next();
  };
}

// Usage tracking middleware
export async function trackUsage(req, res, next) {
  if (!req.tenant) {
    return next();
  }
  
  try {
    // Track API usage for billing
    const usageData = {
      tenant_id: req.tenant_id,
      endpoint: req.path,
      method: req.method,
      user_agent: req.get('User-Agent'),
      ip_address: req.ip,
      timestamp: new Date()
    };
    
    // Store usage data (you might want to batch this or use a queue)
    await pool.query(`
      INSERT INTO audit_logs (tenant_id, action, resource_type, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      req.tenant_id,
      `${req.method} ${req.path}`,
      'api_usage',
      req.ip,
      req.get('User-Agent'),
      new Date()
    ]);
    
    next();
  } catch (error) {
    // Don't fail the request if usage tracking fails
    console.error('Error tracking usage:', error);
    next();
  }
}
