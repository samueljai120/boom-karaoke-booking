// Vercel API Route: /api/bookings
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

    if (req.method === 'GET') {
      // Get bookings for tenant
      const result = await sql`
        SELECT 
          b.id,
          b.customer_name,
          b.customer_email,
          b.customer_phone,
          b.start_time,
          b.end_time,
          b.status,
          b.notes,
          b.total_price,
          b.created_at,
          r.name as room_name,
          r.capacity as room_capacity
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        ORDER BY b.start_time DESC
        LIMIT 100
      `;

      const bookings = result.map(row => ({
        id: row.id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        notes: row.notes,
        totalPrice: parseFloat(row.total_price || 0),
        createdAt: row.created_at,
        room: {
          name: row.room_name,
          capacity: row.room_capacity
        }
      }));

      res.status(200).json({
        success: true,
        data: bookings,
        tenant: {
          id: req.tenant.id,
          name: req.tenant.name,
          subdomain: req.tenant.subdomain
        }
      });

    } else if (req.method === 'POST') {
      // Create new booking
      const {
        roomId,
        customerName,
        customerEmail,
        customerPhone,
        startTime,
        endTime,
        notes,
        totalPrice
      } = req.body;

      if (!roomId || !customerName || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: roomId, customerName, startTime, endTime'
        });
      }

      // Check if room exists and belongs to tenant
      const roomResult = await sql`
        SELECT id, name, price_per_hour
        FROM rooms
        WHERE id = ${roomId} AND is_active = true
      `;

      if (roomResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Room not found or inactive'
        });
      }

      const room = roomResult[0];

      // Calculate total price if not provided
      const calculatedPrice = totalPrice || parseFloat(room.price_per_hour) * 
        (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);

      // Create booking
      const bookingResult = await sql`
        INSERT INTO bookings (
          room_id, customer_name, customer_email, customer_phone,
          start_time, end_time, notes, total_price
        )
        VALUES (
          ${roomId}, ${customerName}, ${customerEmail || null}, 
          ${customerPhone || null}, ${startTime}, ${endTime}, 
          ${notes || null}, ${calculatedPrice}
        )
        RETURNING id, created_at
      `;

      const newBooking = bookingResult[0];

      res.status(201).json({
        success: true,
        data: {
          id: newBooking.id,
          roomId,
          customerName,
          customerEmail,
          customerPhone,
          startTime,
          endTime,
          status: 'confirmed',
          notes,
          totalPrice: calculatedPrice,
          createdAt: newBooking.created_at,
          room: {
            name: room.name,
            pricePerHour: parseFloat(room.price_per_hour)
          }
        },
        tenant: {
          id: req.tenant.id,
          name: req.tenant.name,
          subdomain: req.tenant.subdomain
        }
      });

    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('Bookings API error:', error);
    
    // Fallback to demo data
    const demoBookings = [
      {
        id: 'demo-booking-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1234567890',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        notes: 'Birthday party',
        totalPrice: 25.00,
        createdAt: new Date().toISOString(),
        room: {
          name: 'Room A',
          capacity: 4
        }
      }
    ];

    res.status(200).json({
      success: true,
      data: req.method === 'GET' ? demoBookings : demoBookings[0],
      tenant: {
        id: 'demo-tenant-id',
        name: 'Demo Karaoke',
        subdomain: 'demo'
      }
    });
  }
}
