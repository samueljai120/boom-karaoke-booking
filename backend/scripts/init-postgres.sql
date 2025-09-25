-- PostgreSQL Initialization Script for Boom Booking SaaS
-- This script sets up the initial database structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tenants table
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
);

-- Create global users table
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
);

-- Create tenant users table
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Create rooms table with tenant isolation
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
);

-- Create bookings table with tenant isolation
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
);

-- Create business hours table with tenant isolation
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
);

-- Create settings table with tenant isolation
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- Create audit log table
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
);

-- Enable Row Level Security on all tenant-specific tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY tenant_isolation_rooms ON rooms
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_bookings ON bookings
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_business_hours ON business_hours
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_settings ON settings
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  FOR ALL TO PUBLIC
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_users_tenant_user ON tenant_users(tenant_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_room_time ON bookings(room_id, start_time, end_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_tenant_date ON bookings(tenant_id, start_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_hours_tenant_id ON business_hours(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_tenant_id ON settings(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON business_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default tenant
INSERT INTO tenants (name, subdomain, plan_type, status, settings)
VALUES (
  'Demo Karaoke',
  'demo',
  'professional',
  'active',
  '{"timezone": "America/New_York", "currency": "USD", "booking_advance_days": 30, "booking_min_duration": 60, "booking_max_duration": 480}'
) ON CONFLICT (subdomain) DO NOTHING;

-- Insert default admin user
INSERT INTO users (email, password, name, email_verified)
VALUES (
  'demo@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: demo123
  'Demo Admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Link default user to default tenant
INSERT INTO tenant_users (tenant_id, user_id, role, permissions)
SELECT 
  t.id,
  u.id,
  'admin',
  '{"all": true}'::jsonb
FROM tenants t, users u
WHERE t.subdomain = 'demo' AND u.email = 'demo@example.com'
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Insert default rooms
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
ON CONFLICT DO NOTHING;

-- Insert default business hours
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
ON CONFLICT (tenant_id, day_of_week) DO NOTHING;

-- Insert default settings
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
ON CONFLICT (tenant_id, key) DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Create a function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql;

COMMENT ON DATABASE boom_booking IS 'Boom Karaoke Booking System - Multi-tenant SaaS Database';


