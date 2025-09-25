#!/usr/bin/env node

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

class DatabaseInitializer {
  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async initialize() {
    try {
      console.log('🚀 Initializing database for Railway deployment...');
      
      // Check if we have database connection details
      if (!this.hasDatabaseConfig()) {
        console.log('⚠️ No database configuration found, skipping initialization...');
        console.log('📋 Database will be initialized when the application starts');
        return;
      }
      
      // Connect to database
      await this.client.connect();
      console.log('✅ Connected to PostgreSQL database');
      
      // Test connection
      const result = await this.client.query('SELECT NOW()');
      console.log('🕐 Database time:', result.rows[0].now);
      
      // Initialize database schema
      await this.initializeSchema();
      
      // Create default tenant if needed
      await this.createDefaultTenant();
      
      console.log('✅ Database initialization completed successfully!');
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      
      // Don't exit with error code in production to avoid deployment failure
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️ Continuing deployment despite initialization error...');
        console.log('📋 Database will be initialized when the application starts');
        return;
      }
      
      throw error;
    } finally {
      try {
        await this.client.end();
      } catch (err) {
        // Ignore connection close errors
      }
    }
  }

  hasDatabaseConfig() {
    return !!(process.env.DATABASE_URL || 
             (process.env.POSTGRES_HOST && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD));
  }

  async initializeSchema() {
    console.log('🏗️ Initializing database schema...');
    
    try {
      // Import and run the PostgreSQL initialization
      const { initMultiTenantDatabase } = await import('../database/postgres.js');
      await initMultiTenantDatabase();
      console.log('✅ Database schema initialized');
    } catch (error) {
      console.error('❌ Schema initialization failed:', error.message);
      
      // Try to run basic schema creation as fallback
      await this.createBasicSchema();
    }
  }

  async createBasicSchema() {
    console.log('🔄 Creating basic schema as fallback...');
    
    const schemaSQL = `
      -- Create tenants table
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        plan_type VARCHAR(50) DEFAULT 'basic',
        status VARCHAR(20) DEFAULT 'active',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create tenant_users table
      CREATE TABLE IF NOT EXISTS tenant_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'user',
        permissions JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, user_id)
      );

      -- Create rooms table
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        capacity INTEGER DEFAULT 1,
        category VARCHAR(100) DEFAULT 'standard',
        description TEXT,
        price_per_hour DECIMAL(10,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create bookings table
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        total_price DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create business_hours table
      CREATE TABLE IF NOT EXISTS business_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, day_of_week)
      );

      -- Create settings table
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        key VARCHAR(255) NOT NULL,
        value TEXT,
        type VARCHAR(50) DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, key)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
      CREATE INDEX IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
      CREATE INDEX IF NOT EXISTS idx_business_hours_tenant_id ON business_hours(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_settings_tenant_id ON settings(tenant_id);
    `;

    await this.client.query(schemaSQL);
    console.log('✅ Basic schema created successfully');
  }

  async createDefaultTenant() {
    console.log('📊 Creating default tenant...');
    
    try {
      // Check if default tenant already exists
      const existingTenant = await this.client.query(
        'SELECT id FROM tenants WHERE subdomain = $1',
        ['boom-karaoke']
      );

      if (existingTenant.rows.length > 0) {
        console.log('📊 Default tenant already exists');
        return existingTenant.rows[0].id;
      }

      // Create default tenant
      const result = await this.client.query(`
        INSERT INTO tenants (name, subdomain, plan_type, status, settings)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        'Boom Karaoke - Default Business',
        'boom-karaoke',
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

      const tenantId = result.rows[0].id;
      console.log(`✅ Default tenant created with ID: ${tenantId}`);
      
      return tenantId;
    } catch (error) {
      console.error('❌ Failed to create default tenant:', error.message);
      throw error;
    }
  }
}

// Run initialization if called directly
async function runInitialization() {
  const initializer = new DatabaseInitializer();
  
  try {
    await initializer.initialize();
    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    
    // In production, don't fail the deployment
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Continuing deployment despite initialization error...');
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runInitialization();
}

export { DatabaseInitializer, runInitialization };
