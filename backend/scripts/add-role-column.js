import { pool } from '../database/postgres.js';
import dotenv from 'dotenv';

dotenv.config();

async function addRoleColumn() {
  const client = await pool.connect();
  try {
    console.log('🔧 Adding role column to users table...');
    
    // Check if role column exists
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (columnExists.rows.length > 0) {
      console.log('✅ Role column already exists');
      return;
    }
    
    // Add role column
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN role VARCHAR(50) DEFAULT 'user'
    `);
    
    console.log('✅ Role column added successfully');
    
    // Update existing users to have 'user' role
    await client.query(`
      UPDATE users 
      SET role = 'user' 
      WHERE role IS NULL
    `);
    
    console.log('✅ Existing users updated with default role');
    
  } catch (error) {
    console.error('❌ Failed to add role column:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
addRoleColumn()
  .then(() => {
    console.log('🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

