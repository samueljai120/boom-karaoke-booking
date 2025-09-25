// Vercel API Route: /api/rooms
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
    
    // Get rooms from database with tenant isolation
    const result = await sql`
      SELECT id, name, capacity, category, description, price_per_hour, is_active
      FROM rooms
      WHERE is_active = true
      ORDER BY name
    `;

    const rooms = result.map(row => ({
      id: row.id,
      name: row.name,
      capacity: row.capacity,
      category: row.category,
      description: row.description,
      pricePerHour: parseFloat(row.price_per_hour),
      isActive: row.is_active
    }));

    res.status(200).json({
      success: true,
      data: rooms,
      tenant: {
        id: req.tenant.id,
        name: req.tenant.name,
        subdomain: req.tenant.subdomain
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Fallback to static data for demo tenant
    const rooms = [
      { id: 'demo-room-1', name: 'Room A', capacity: 4, category: 'Standard', isActive: true, pricePerHour: 25.00 },
      { id: 'demo-room-2', name: 'Room B', capacity: 6, category: 'Premium', isActive: true, pricePerHour: 35.00 },
      { id: 'demo-room-3', name: 'Room C', capacity: 8, category: 'VIP', isActive: true, pricePerHour: 50.00 }
    ];

    res.status(200).json({
      success: true,
      data: rooms,
      tenant: {
        id: 'demo-tenant-id',
        name: 'Demo Karaoke',
        subdomain: 'demo'
      }
    });
  }
}
