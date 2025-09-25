// Vercel API Route: /api/business-hours
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
    
    // Get business hours from database
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
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Fallback to static data
    const businessHours = [
      { day: 'monday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'tuesday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'wednesday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'thursday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'friday', open: '09:00', close: '23:00', isOpen: true },
      { day: 'saturday', open: '10:00', close: '23:00', isOpen: true },
      { day: 'sunday', open: '10:00', close: '21:00', isOpen: true }
    ];

    res.status(200).json({
      success: true,
      data: {
        businessHours
      }
    });
  }
}
