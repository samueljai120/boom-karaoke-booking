// Tenant middleware for Vercel API routes
import { getTenantBySubdomain, setTenantContext } from './neon-db.js';

// Extract subdomain from host header
export function extractSubdomain(host) {
  if (!host) return null;
  
  const parts = host.split('.');
  
  // Handle localhost development
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0] !== 'www' ? parts[0] : null;
  }
  
  // Handle production domains (e.g., demo.boom-booking.com)
  if (parts.length >= 3) {
    return parts[0] !== 'www' ? parts[0] : null;
  }
  
  return null;
}

// Tenant resolution middleware
export async function resolveTenant(req, res, next) {
  try {
    const host = req.headers.host || '';
    const subdomain = extractSubdomain(host);
    
    // If no subdomain, use default demo tenant for now
    if (!subdomain) {
      req.tenant = {
        id: 'demo-tenant-id', // This will be replaced with actual tenant ID
        subdomain: 'demo',
        name: 'Demo Karaoke',
        plan_type: 'professional',
        status: 'active'
      };
      req.tenant_id = 'demo-tenant-id';
      return next();
    }
    
    // Look up tenant by subdomain
    const tenant = await getTenantBySubdomain(subdomain);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
        message: `No active tenant found for subdomain: ${subdomain}`
      });
    }
    
    // Set tenant context
    req.tenant = tenant;
    req.tenant_id = tenant.id;
    
    // Set tenant context in database
    await setTenantContext(tenant.id);
    
    next();
  } catch (error) {
    console.error('Error resolving tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve tenant',
      message: 'Internal server error while looking up tenant'
    });
  }
}

// Tenant validation middleware
export function validateTenant(req, res, next) {
  if (!req.tenant) {
    return res.status(400).json({
      success: false,
      error: 'No tenant context',
      message: 'This endpoint requires a valid tenant subdomain'
    });
  }
  
  if (req.tenant.status !== 'active') {
    return res.status(403).json({
      success: false,
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
      return res.status(400).json({
        success: false,
        error: 'No tenant context'
      });
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
        success: false,
        error: 'Plan upgrade required',
        message: `This feature requires a ${requiredPlan} plan or higher`,
        currentPlan: req.tenant.plan_type,
        requiredPlan: requiredPlan
      });
    }
    
    next();
  };
}

// CORS headers helper
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Tenant-ID'
  );
}

// Handle preflight requests
export function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
