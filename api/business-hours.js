// Vercel API Route: /api/business-hours
import { sql, initDatabase, setTenantContext } from '../lib/neon-db.js';
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
    
    // Set tenant context for RLS
    await setTenantContext(req.tenant_id);
    
    // Get business hours from database with tenant isolation
    const result = await sql`
      SELECT day_of_week, open_time, close_time, is_closed
      FROM business_hours
      ORDER BY day_of_week
    `;

    // Convert to frontend format
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const businessHours = result.map(row => ({
      day: dayNames[row.day_of_week],
      open: row.open_time,
      close: row.close_time,
      isOpen: !row.is_closed
    }));

    res.status(200).json({
      success: true,
      data: {
        businessHours
      },
      tenant: {
        id: req.tenant.id,
        name: req.tenant.name,
        subdomain: req.tenant.subdomain
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Fallback to static data for demo tenant
    const businessHours = [
      { day: 'sunday', open: '10:00', close: '22:00', isOpen: true },
      { day: 'monday', open: '10:00', close: '22:00', isOpen: true },
      { day: 'tuesday', open: '10:00', close: '22:00', isOpen: true },
      { day: 'wednesday', open: '10:00', close: '22:00', isOpen: true },
      { day: 'thursday', open: '10:00', close: '22:00', isOpen: true },
      { day: 'friday', open: '10:00', close: '22:00', isOpen: true },
      { day: 'saturday', open: '10:00', close: '22:00', isOpen: true }
    ];

    res.status(200).json({
      success: true,
      data: {
        businessHours
      },
      tenant: {
        id: 'demo-tenant-id',
        name: 'Demo Karaoke',
        subdomain: 'demo'
      }
    });
  }
}
