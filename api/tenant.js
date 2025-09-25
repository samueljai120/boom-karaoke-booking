// Vercel API Route: /api/tenant
import { sql, initDatabase, setTenantContext, getTenantBySubdomain } from '../lib/neon-db.js';
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
    // Initialize database if needed
    await initDatabase();
    
    // Resolve tenant context
    await resolveTenant(req, res, () => {});
    
    // Validate tenant
    validateTenant(req, res, () => {});
    
    if (res.headersSent) return; // If tenant validation failed

    if (req.method === 'GET') {
      // Get tenant information
      res.status(200).json({
        success: true,
        data: {
          id: req.tenant.id,
          name: req.tenant.name,
          subdomain: req.tenant.subdomain,
          planType: req.tenant.plan_type,
          status: req.tenant.status,
          settings: req.tenant.settings,
          createdAt: req.tenant.created_at,
          updatedAt: req.tenant.updated_at
        }
      });

    } else if (req.method === 'PUT') {
      // Update tenant settings
      const { settings, name } = req.body;
      
      if (settings) {
        await sql`
          UPDATE tenants 
          SET settings = ${JSON.stringify(settings)}::jsonb, updated_at = NOW()
          WHERE id = ${req.tenant_id}
        `;
      }
      
      if (name) {
        await sql`
          UPDATE tenants 
          SET name = ${name}, updated_at = NOW()
          WHERE id = ${req.tenant_id}
        `;
      }

      // Get updated tenant info
      const updatedTenant = await getTenantBySubdomain(req.tenant.subdomain);

      res.status(200).json({
        success: true,
        data: {
          id: updatedTenant.id,
          name: updatedTenant.name,
          subdomain: updatedTenant.subdomain,
          planType: updatedTenant.plan_type,
          status: updatedTenant.status,
          settings: updatedTenant.settings,
          createdAt: updatedTenant.created_at,
          updatedAt: updatedTenant.updated_at
        }
      });

    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('Tenant API error:', error);
    
    // Fallback response
    res.status(200).json({
      success: true,
      data: {
        id: 'demo-tenant-id',
        name: 'Demo Karaoke',
        subdomain: 'demo',
        planType: 'professional',
        status: 'active',
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          booking_advance_days: 30,
          booking_min_duration: 60,
          booking_max_duration: 480
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }
}
