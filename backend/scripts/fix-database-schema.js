import { pool } from '../database/postgres.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabaseSchema() {
  const client = await pool.connect();
  try {
    console.log('🔧 Fixing database schema...');
    
    // 1. Add role column to users table if it doesn't exist
    console.log('📝 Checking users table schema...');
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (columnExists.rows.length === 0) {
      console.log('➕ Adding role column to users table...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user'
      `);
      console.log('✅ Role column added successfully');
    } else {
      console.log('✅ Role column already exists');
    }
    
    // 2. Update existing users to have 'user' role if null
    console.log('🔄 Updating existing users...');
    const updateResult = await client.query(`
      UPDATE users 
      SET role = 'user' 
      WHERE role IS NULL OR role = ''
    `);
    console.log(`✅ Updated ${updateResult.rowCount} users with default role`);
    
    // 3. Check if we have any users at all
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total users in database: ${userCount.rows[0].count}`);
    
    // 4. Check if we have any tenants
    const tenantCount = await client.query('SELECT COUNT(*) as count FROM tenants');
    console.log(`🏢 Total tenants in database: ${tenantCount.rows[0].count}`);
    
    // 5. Check if we have any rooms
    const roomCount = await client.query('SELECT COUNT(*) as count FROM rooms');
    console.log(`🏠 Total rooms in database: ${roomCount.rows[0].count}`);
    
    // 6. If no data exists, create default data
    if (userCount.rows[0].count === 0 || tenantCount.rows[0].count === 0) {
      console.log('🌱 Creating default data...');
      
      // Create default tenant
      const tenantResult = await client.query(`
        INSERT INTO tenants (name, subdomain, plan_type, status, settings)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        'Demo Karaoke',
        'demo',
        'professional',
        'active',
        JSON.stringify({
          timezone: 'America/New_York',
          currency: 'USD',
          booking_advance_days: 30,
          booking_min_duration: 60,
          booking_max_duration: 480
        })
      ]);
      
      const tenantId = tenantResult.rows[0].id;
      console.log(`✅ Created default tenant: ${tenantId}`);
      
      // Create default admin user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = bcrypt.hashSync('demo123', 10);
      
      const userResult = await client.query(`
        INSERT INTO users (email, password, name, role, email_verified)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, ['demo@example.com', hashedPassword, 'Demo Admin', 'admin', true]);
      
      const userId = userResult.rows[0].id;
      console.log(`✅ Created default admin user: ${userId}`);
      
      // Link user to tenant
      await client.query(`
        INSERT INTO tenant_users (tenant_id, user_id, role, permissions)
        VALUES ($1, $2, $3, $4)
      `, [
        tenantId,
        userId,
        'admin',
        JSON.stringify({ all: true })
      ]);
      console.log('✅ Linked admin user to tenant');
      
      // Create default rooms
      const rooms = [
        ['Room A', 4, 'Standard', 'Standard karaoke room for small groups', 25.00],
        ['Room B', 6, 'Premium', 'Premium room with better sound system', 35.00],
        ['Room C', 8, 'VIP', 'VIP room with luxury amenities', 50.00]
      ];
      
      for (const room of rooms) {
        await client.query(`
          INSERT INTO rooms (tenant_id, name, capacity, category, description, price_per_hour)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [tenantId, ...room]);
      }
      console.log('✅ Created default rooms');
      
      // Create default business hours
      for (let day = 0; day < 7; day++) {
        await client.query(`
          INSERT INTO business_hours (tenant_id, day_of_week, open_time, close_time)
          VALUES ($1, $2, $3, $4)
        `, [tenantId, day, '10:00', '22:00']);
      }
      console.log('✅ Created default business hours');
      
      // Create default settings
      const settings = [
        ['app_name', 'Boom Karaoke', 'string'],
        ['timezone', 'America/New_York', 'string'],
        ['currency', 'USD', 'string'],
        ['booking_advance_days', '30', 'number'],
        ['booking_min_duration', '60', 'number'],
        ['booking_max_duration', '480', 'number']
      ];
      
      for (const [key, value, type] of settings) {
        await client.query(`
          INSERT INTO settings (tenant_id, key, value, type)
          VALUES ($1, $2, $3, $4)
        `, [tenantId, key, value, type]);
      }
      console.log('✅ Created default settings');
    }
    
    console.log('🎉 Database schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to fix database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
fixDatabaseSchema()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

