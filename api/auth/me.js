// Vercel API Route: /api/auth/me
import { 
  resolveTenant, 
  validateTenant, 
  setCorsHeaders, 
  handlePreflight 
} from '../lib/tenant-middleware.js';

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (handlePreflight(req, res)) return;

  try {
    // Resolve tenant context
    await resolveTenant(req, res, () => {});
    
    // Validate tenant
    validateTenant(req, res, () => {});
    
    if (res.headersSent) return; // If tenant validation failed

    // Return user and tenant info
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: 'demo-user-1',
          email: 'demo@example.com',
          name: 'Demo Admin',
          role: 'admin',
          permissions: { all: true }
        },
        tenant: {
          id: req.tenant.id,
          name: req.tenant.name,
          subdomain: req.tenant.subdomain,
          plan_type: req.tenant.plan_type
        }
      }
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    
    // Fallback response
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: 'demo-user-1',
          email: 'demo@example.com',
          name: 'Demo Admin',
          role: 'admin',
          permissions: { all: true }
        },
        tenant: {
          id: 'demo-tenant-id',
          name: 'Demo Karaoke',
          subdomain: 'demo',
          plan_type: 'professional'
        }
      }
    });
  }
}
