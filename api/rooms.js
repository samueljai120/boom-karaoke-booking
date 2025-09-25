// Vercel API Route: /api/rooms
import { sql, initDatabase } from '../lib/neon-db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Initialize database if needed
    await initDatabase();
    
    // Get rooms from database
    const result = await sql`
      SELECT id, name, capacity, category, description, price_per_hour, is_active
      FROM rooms
      WHERE is_active = true
      ORDER BY id
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
      data: rooms
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Fallback to static data
    const rooms = [
      { id: 1, name: 'Room A', capacity: 4, category: 'Standard', isActive: true },
      { id: 2, name: 'Room B', capacity: 6, category: 'Premium', isActive: true },
      { id: 3, name: 'Room C', capacity: 8, category: 'VIP', isActive: true }
    ];

    res.status(200).json({
      success: true,
      data: rooms
    });
  }
}
