// Neon PostgreSQL connection for Vercel Functions
import { neon } from '@neondatabase/serverless';

// Neon configuration
const sql = neon(process.env.DATABASE_URL);

// Database initialization with multi-tenant schema
export async function initDatabase() {
  try {
    console.log('🗄️ Initializing Neon multi-tenant database...');
    
    // Create extensions
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    // Create tenants table
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        domain VARCHAR(255),
        plan_type VARCHAR(50) DEFAULT 'basic',
        status VARCHAR(20) DEFAULT 'active',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create global users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        email_verified BOOLEAN DEFAULT FALSE,
        mfa_enabled BOOLEAN DEFAULT FALSE,
        mfa_secret VARCHAR(255),
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create tenant users table
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'user',
        permissions JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(tenant_id, user_id)
      )
    `;

    // Create rooms table with tenant isolation
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        capacity INTEGER NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        price_per_hour DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create bookings table with tenant isolation
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        notes TEXT,
        total_price DECIMAL(10,2),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create business hours table with tenant isolation
    await sql`
      CREATE TABLE IF NOT EXISTS business_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        open_time TIME NOT NULL,
        close_time TIME NOT NULL,
        is_closed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(tenant_id, day_of_week)
      )
    `;

    // Create settings table with tenant isolation
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        key VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'string',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(tenant_id, key)
      )
    `;

    // Create audit log table
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        resource_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Enable Row Level Security on all tenant-specific tables
    await sql`ALTER TABLE rooms ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE bookings ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE settings ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY`;

    // Create RLS policies for tenant isolation
    await sql`
      CREATE POLICY IF NOT EXISTS tenant_isolation_rooms ON rooms
      FOR ALL TO PUBLIC
      USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
    `;

    await sql`
      CREATE POLICY IF NOT EXISTS tenant_isolation_bookings ON bookings
      FOR ALL TO PUBLIC
      USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
    `;

    await sql`
      CREATE POLICY IF NOT EXISTS tenant_isolation_business_hours ON business_hours
      FOR ALL TO PUBLIC
      USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
    `;

    await sql`
      CREATE POLICY IF NOT EXISTS tenant_isolation_settings ON settings
      FOR ALL TO PUBLIC
      USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
    `;

    await sql`
      CREATE POLICY IF NOT EXISTS tenant_isolation_audit_logs ON audit_logs
      FOR ALL TO PUBLIC
      USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
    `;

    // Create indexes for performance
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_users_tenant_user ON tenant_users(tenant_id, user_id)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_room_time ON bookings(room_id, start_time, end_time)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_tenant_date ON bookings(tenant_id, start_time)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_hours_tenant_id ON business_hours(tenant_id)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_tenant_id ON settings(tenant_id)`;
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id)`;

    // Create function to set tenant context
    await sql`
      CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.current_tenant_id', tenant_uuid::text, false);
      END;
      $$ LANGUAGE plpgsql
    `;

    // Insert default data
    await insertDefaultData();
    
    console.log('✅ Neon multi-tenant database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Neon database initialization failed:', error);
    return false;
  }
}

// Insert default data for multi-tenant setup
async function insertDefaultData() {
  try {
    // Check if default tenant already exists
    const tenantCount = await sql`SELECT COUNT(*) as count FROM tenants WHERE subdomain = 'demo'`;
    if (tenantCount[0].count > 0) {
      console.log('✅ Default tenant data already exists');
      return;
    }

    // Insert default tenant
    await sql`
      INSERT INTO tenants (name, subdomain, plan_type, status, settings)
      VALUES (
        'Demo Karaoke',
        'demo',
        'professional',
        'active',
        '{"timezone": "America/New_York", "currency": "USD", "booking_advance_days": 30, "booking_min_duration": 60, "booking_max_duration": 480}'::jsonb
      )
    `;

    // Insert default admin user
    await sql`
      INSERT INTO users (email, password, name, email_verified)
      VALUES (
        'demo@example.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: demo123
        'Demo Admin',
        true
      )
    `;

    // Link default user to default tenant
    await sql`
      INSERT INTO tenant_users (tenant_id, user_id, role, permissions)
      SELECT 
        t.id,
        u.id,
        'admin',
        '{"all": true}'::jsonb
      FROM tenants t, users u
      WHERE t.subdomain = 'demo' AND u.email = 'demo@example.com'
    `;

    // Insert default rooms for demo tenant
    await sql`
      INSERT INTO rooms (tenant_id, name, capacity, category, description, price_per_hour)
      SELECT 
        t.id,
        room_data.name,
        room_data.capacity,
        room_data.category,
        room_data.description,
        room_data.price_per_hour
      FROM tenants t,
      (VALUES 
        ('Room A', 4, 'Standard', 'Standard karaoke room for small groups', 25.00),
        ('Room B', 6, 'Premium', 'Premium room with better sound system', 35.00),
        ('Room C', 8, 'VIP', 'VIP room with luxury amenities', 50.00)
      ) AS room_data(name, capacity, category, description, price_per_hour)
      WHERE t.subdomain = 'demo'
    `;

    // Insert default business hours for demo tenant
    await sql`
      INSERT INTO business_hours (tenant_id, day_of_week, open_time, close_time)
      SELECT 
        t.id,
        day_data.day_of_week,
        day_data.open_time::time,
        day_data.close_time::time
      FROM tenants t,
      (VALUES 
        (0, '10:00', '22:00'),
        (1, '10:00', '22:00'),
        (2, '10:00', '22:00'),
        (3, '10:00', '22:00'),
        (4, '10:00', '22:00'),
        (5, '10:00', '22:00'),
        (6, '10:00', '22:00')
      ) AS day_data(day_of_week, open_time, close_time)
      WHERE t.subdomain = 'demo'
    `;

    // Insert default settings for demo tenant
    await sql`
      INSERT INTO settings (tenant_id, key, value, type)
      SELECT 
        t.id,
        setting_data.key,
        setting_data.value,
        setting_data.type
      FROM tenants t,
      (VALUES 
        ('app_name', 'Boom Karaoke', 'string'),
        ('timezone', 'America/New_York', 'string'),
        ('currency', 'USD', 'string'),
        ('booking_advance_days', '30', 'number'),
        ('booking_min_duration', '60', 'number'),
        ('booking_max_duration', '480', 'number')
      ) AS setting_data(key, value, type)
      WHERE t.subdomain = 'demo'
    `;

    console.log('✅ Default multi-tenant data inserted successfully');
  } catch (error) {
    console.error('❌ Failed to insert default data:', error);
  }
}

// Tenant context utilities
export async function setTenantContext(tenantId) {
  try {
    await sql`SELECT set_config('app.current_tenant_id', ${tenantId}::text, false)`;
    return true;
  } catch (error) {
    console.error('Error setting tenant context:', error);
    return false;
  }
}

export async function getTenantBySubdomain(subdomain) {
  try {
    const result = await sql`
      SELECT id, name, subdomain, plan_type, status, settings
      FROM tenants 
      WHERE subdomain = ${subdomain} AND status = 'active'
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting tenant by subdomain:', error);
    return null;
  }
}

export async function getTenantById(tenantId) {
  try {
    const result = await sql`
      SELECT id, name, subdomain, plan_type, status, settings
      FROM tenants 
      WHERE id = ${tenantId} AND status = 'active'
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error getting tenant by ID:', error);
    return null;
  }
}

// Export sql for use in API routes
export { sql };
