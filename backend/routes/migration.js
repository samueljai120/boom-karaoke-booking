import express from 'express';
import { pool } from '../database/postgres.js';

const router = express.Router();

// Emergency database fix endpoint
router.post('/emergency-fix', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('🚨 EMERGENCY DATABASE FIX STARTING...');
    
    // 1. Check current database state
    console.log('📊 Checking current database state...');
    
    // Check if users table exists
    const usersTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);
    
    if (!usersTableExists.rows[0].exists) {
      console.log('❌ Users table does not exist! Creating it...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Users table created successfully');
    } else {
      console.log('✅ Users table exists');
    }
    
    // 2. Check if role column exists
    console.log('🔍 Checking for role column...');
    const roleColumnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (roleColumnExists.rows.length === 0) {
      console.log('❌ Role column missing! Adding it...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user'
      `);
      console.log('✅ Role column added successfully');
    } else {
      console.log('✅ Role column exists');
    }
    
    // 3. Update existing users with default role
    console.log('🔄 Updating existing users...');
    const updateResult = await client.query(`
      UPDATE users 
      SET role = 'user' 
      WHERE role IS NULL OR role = ''
    `);
    console.log(`✅ Updated ${updateResult.rowCount} users with default role`);
    
    // 4. Create rooms table if it doesn't exist
    console.log('🏠 Checking rooms table...');
    const roomsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'rooms'
      )
    `);
    
    if (!roomsTableExists.rows[0].exists) {
      console.log('❌ Rooms table does not exist! Creating it...');
      await client.query(`
        CREATE TABLE rooms (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          capacity INTEGER NOT NULL,
          category VARCHAR(255) NOT NULL,
          description TEXT,
          price_per_hour DECIMAL(10,2) DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Rooms table created successfully');
      
      // Insert default rooms
      const rooms = [
        ['Room A', 4, 'Standard', 'Standard karaoke room for small groups', 25.00],
        ['Room B', 6, 'Premium', 'Premium room with better sound system', 35.00],
        ['Room C', 8, 'VIP', 'VIP room with luxury amenities', 50.00]
      ];
      
      for (const room of rooms) {
        await client.query(`
          INSERT INTO rooms (name, capacity, category, description, price_per_hour)
          VALUES ($1, $2, $3, $4, $5)
        `, room);
      }
      console.log('✅ Default rooms inserted');
    } else {
      console.log('✅ Rooms table exists');
    }
    
    // 5. Create bookings table if it doesn't exist
    console.log('📅 Checking bookings table...');
    const bookingsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'bookings'
      )
    `);
    
    if (!bookingsTableExists.rows[0].exists) {
      console.log('❌ Bookings table does not exist! Creating it...');
      await client.query(`
        CREATE TABLE bookings (
          id SERIAL PRIMARY KEY,
          room_id INTEGER NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255),
          customer_phone VARCHAR(20),
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP NOT NULL,
          status VARCHAR(20) DEFAULT 'confirmed',
          notes TEXT,
          total_price DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms (id)
        )
      `);
      console.log('✅ Bookings table created successfully');
    } else {
      console.log('✅ Bookings table exists');
    }
    
    // 6. Create demo user if it doesn't exist
    console.log('👤 Checking demo user...');
    const demoUserExists = await client.query('SELECT id FROM users WHERE email = $1', ['demo@example.com']);
    if (demoUserExists.rows.length === 0) {
      console.log('❌ Demo user does not exist! Creating it...');
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('demo123', 10);
      
      await client.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        ['demo@example.com', hashedPassword, 'Demo User', 'admin']
      );
      console.log('✅ Demo user created successfully');
    } else {
      console.log('✅ Demo user exists');
    }
    
    // 7. Final verification
    console.log('🔍 Final verification...');
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const roomCount = await client.query('SELECT COUNT(*) as count FROM rooms');
    const bookingCount = await client.query('SELECT COUNT(*) as count FROM bookings');
    
    console.log('📊 Database Summary:');
    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Rooms: ${roomCount.rows[0].count}`);
    console.log(`   - Bookings: ${bookingCount.rows[0].count}`);
    
    console.log('🎉 EMERGENCY DATABASE FIX COMPLETED SUCCESSFULLY!');
    
    res.json({
      success: true,
      message: 'Emergency database fix completed successfully',
      data: {
        users: userCount.rows[0].count,
        rooms: roomCount.rows[0].count,
        bookings: bookingCount.rows[0].count,
        roleColumnAdded: roleColumnExists.rows.length === 0
      }
    });
    
  } catch (error) {
    console.error('💥 Emergency database fix failed:', error);
    res.status(500).json({
      success: false,
      error: 'Emergency database fix failed',
      message: error.message
    });
  } finally {
    client.release();
  }
});

// Migration endpoint to fix database schema
router.post('/fix-schema', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('🔧 Running database schema migration...');
    
    // Check if role column exists in users table
    const roleColumnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (roleColumnExists.rows.length === 0) {
      console.log('➕ Adding missing role column to users table...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user'
      `);
      console.log('✅ Role column added successfully');
      
      // Update existing users to have 'user' role
      const updateResult = await client.query(`
        UPDATE users 
        SET role = 'user' 
        WHERE role IS NULL OR role = ''
      `);
      console.log(`✅ Updated ${updateResult.rowCount} users with default role`);
    } else {
      console.log('✅ Role column already exists');
    }
    
    // Check current data
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const tenantCount = await client.query('SELECT COUNT(*) as count FROM tenants');
    const roomCount = await client.query('SELECT COUNT(*) as count FROM rooms');
    
    res.json({
      success: true,
      message: 'Database schema migration completed successfully',
      data: {
        users: userCount.rows[0].count,
        tenants: tenantCount.rows[0].count,
        rooms: roomCount.rows[0].count,
        roleColumnAdded: roleColumnExists.rows.length === 0
      }
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      message: error.message
    });
  } finally {
    client.release();
  }
});

export default router;

