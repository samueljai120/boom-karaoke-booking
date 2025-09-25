# Database Migration Plan: SQLite to PostgreSQL

## Executive Summary

This document outlines the comprehensive migration strategy from SQLite to PostgreSQL for the Boom Karaoke Booking System, including multi-tenancy implementation, data migration procedures, and production deployment considerations.

## Current SQLite Schema Analysis

### Existing Tables

#### `users` Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `rooms` Table
```sql
CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `bookings` Table
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  total_price DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms (id)
);
```

#### `business_hours` Table
```sql
CREATE TABLE business_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL,
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_closed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `settings` Table
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## PostgreSQL Multi-Tenant Schema Design

### Option 1: Row-Level Security (Recommended)

#### Tenant Management Tables

```sql
-- Tenants table for multi-tenancy
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  plan_type VARCHAR(50) DEFAULT 'basic',
  status VARCHAR(20) DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tenant users for cross-tenant user management
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);
```

#### Migrated Tables with Multi-Tenancy

```sql
-- Users table (global)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Rooms table (tenant-specific)
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10,2) DEFAULT 0 CHECK (price_per_hour >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tenant_id, name)
);

-- Bookings table (tenant-specific)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  total_price DECIMAL(10,2) CHECK (total_price >= 0),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

-- Business hours table (tenant-specific)
CREATE TABLE business_hours (
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

-- Settings table (tenant-specific)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  value_type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);
```

### Option 2: Schema-Per-Tenant (Alternative)

```sql
-- Create tenant-specific schemas
CREATE SCHEMA tenant_001;
CREATE SCHEMA tenant_002;
-- ... dynamic schema creation

-- Template schema for new tenants
CREATE SCHEMA tenant_template;

-- Create tables in template schema
CREATE TABLE tenant_template.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL,
  -- ... other fields
);

-- Function to create tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_id UUID, schema_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('CREATE SCHEMA %I', schema_name);
  EXECUTE format('CREATE TABLE %I.rooms (LIKE tenant_template.rooms INCLUDING ALL)', schema_name);
  -- ... create other tables
END;
$$ LANGUAGE plpgsql;
```

## Row-Level Security Implementation

### Enable RLS on All Tables

```sql
-- Enable RLS on tenant-specific tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies

```sql
-- Function to get current tenant ID
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rooms policies
CREATE POLICY tenant_rooms_isolation ON rooms
  FOR ALL TO app_user
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Bookings policies
CREATE POLICY tenant_bookings_isolation ON bookings
  FOR ALL TO app_user
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Business hours policies
CREATE POLICY tenant_business_hours_isolation ON business_hours
  FOR ALL TO app_user
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Settings policies
CREATE POLICY tenant_settings_isolation ON settings
  FOR ALL TO app_user
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Tenant users policies
CREATE POLICY tenant_users_isolation ON tenant_users
  FOR ALL TO app_user
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());
```

## Database Indexes and Performance

### Essential Indexes

```sql
-- Tenant-based indexes
CREATE INDEX idx_rooms_tenant_id ON rooms(tenant_id);
CREATE INDEX idx_rooms_tenant_active ON rooms(tenant_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX idx_bookings_room_time ON bookings(tenant_id, room_id, start_time, end_time);
CREATE INDEX idx_bookings_customer ON bookings(tenant_id, customer_email);
CREATE INDEX idx_business_hours_tenant_day ON business_hours(tenant_id, day_of_week);
CREATE INDEX idx_settings_tenant_key ON settings(tenant_id, key);

-- Composite indexes for common queries
CREATE INDEX idx_bookings_conflict_check ON bookings(room_id, start_time, end_time) WHERE status != 'cancelled';
CREATE INDEX idx_bookings_date_range ON bookings(tenant_id, start_time) WHERE deleted_at IS NULL;

-- Full-text search indexes
CREATE INDEX idx_rooms_search ON rooms USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_bookings_customer_search ON bookings USING gin(to_tsvector('english', customer_name || ' ' || COALESCE(customer_email, '')));
```

### Performance Optimizations

```sql
-- Partial indexes for active records
CREATE INDEX idx_active_rooms ON rooms(tenant_id, name) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_active_bookings ON bookings(tenant_id, start_time) WHERE deleted_at IS NULL;

-- Time-based partitioning for bookings (for large datasets)
CREATE TABLE bookings_2024 PARTITION OF bookings
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Connection pooling configuration
-- max_connections = 100
-- shared_preload_libraries = 'pg_stat_statements'
-- track_activity_query_size = 2048
```

## Data Migration Strategy

### Phase 1: Schema Migration

#### 1.1 Create PostgreSQL Database
```bash
# Create database
createdb boom_karaoke_prod

# Create user and permissions
psql boom_karaoke_prod -c "CREATE USER boom_app WITH PASSWORD 'secure_password';"
psql boom_karaoke_prod -c "GRANT ALL PRIVILEGES ON DATABASE boom_karaoke_prod TO boom_app;"
```

#### 1.2 Run Schema Migration
```bash
# Run migration scripts
psql boom_karaoke_prod -f migrations/001_create_tables.sql
psql boom_karaoke_prod -f migrations/002_create_indexes.sql
psql boom_karaoke_prod -f migrations/003_enable_rls.sql
```

### Phase 2: Data Migration

#### 2.1 Create Default Tenant
```sql
-- Insert default tenant
INSERT INTO tenants (id, name, subdomain, plan_type, settings) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Default Tenant', 'default', 'premium', '{"timezone": "America/New_York", "currency": "USD"}');
```

#### 2.2 Data Migration Script
```javascript
// migration/migrate-data.js
const sqlite3 = require('sqlite3');
const { Pool } = require('pg');

const sqliteDb = new sqlite3.Database('./data/database.sqlite');
const pgPool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

async function migrateUsers() {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM users', async (err, rows) => {
      if (err) return reject(err);
      
      for (const user of rows) {
        await pgPool.query(`
          INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          generateUUID(),
          user.email,
          user.password,
          user.name,
          user.created_at,
          user.updated_at
        ]);
      }
      resolve();
    });
  });
}

async function migrateRooms() {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM rooms', async (err, rows) => {
      if (err) return reject(err);
      
      for (const room of rows) {
        await pgPool.query(`
          INSERT INTO rooms (id, tenant_id, name, capacity, category, description, price_per_hour, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          generateUUID(),
          DEFAULT_TENANT_ID,
          room.name,
          room.capacity,
          room.category,
          room.description,
          room.price_per_hour,
          room.is_active,
          room.created_at,
          room.updated_at
        ]);
      }
      resolve();
    });
  });
}

async function migrateBookings() {
  return new Promise((resolve, reject) => {
    sqliteDb.all(`
      SELECT b.*, r.id as new_room_id
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
    `, async (err, rows) => {
      if (err) return reject(err);
      
      for (const booking of rows) {
        await pgPool.query(`
          INSERT INTO bookings (id, tenant_id, room_id, customer_name, customer_email, customer_phone, start_time, end_time, status, notes, total_price, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          generateUUID(),
          DEFAULT_TENANT_ID,
          booking.new_room_id,
          booking.customer_name,
          booking.customer_email,
          booking.customer_phone,
          booking.start_time,
          booking.end_time,
          booking.status,
          booking.notes,
          booking.total_price,
          booking.created_at,
          booking.updated_at
        ]);
      }
      resolve();
    });
  });
}

async function migrateBusinessHours() {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM business_hours', async (err, rows) => {
      if (err) return reject(err);
      
      for (const hours of rows) {
        await pgPool.query(`
          INSERT INTO business_hours (id, tenant_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          generateUUID(),
          DEFAULT_TENANT_ID,
          hours.day_of_week,
          hours.open_time,
          hours.close_time,
          hours.is_closed,
          hours.created_at,
          hours.updated_at
        ]);
      }
      resolve();
    });
  });
}

async function migrateSettings() {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM settings', async (err, rows) => {
      if (err) return reject(err);
      
      for (const setting of rows) {
        await pgPool.query(`
          INSERT INTO settings (id, tenant_id, key, value, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          generateUUID(),
          DEFAULT_TENANT_ID,
          setting.key,
          setting.value,
          setting.created_at,
          setting.updated_at
        ]);
      }
      resolve();
    });
  });
}

// Main migration function
async function migrateAll() {
  try {
    console.log('Starting data migration...');
    await migrateUsers();
    console.log('✓ Users migrated');
    await migrateRooms();
    console.log('✓ Rooms migrated');
    await migrateBookings();
    console.log('✓ Bookings migrated');
    await migrateBusinessHours();
    console.log('✓ Business hours migrated');
    await migrateSettings();
    console.log('✓ Settings migrated');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
}

migrateAll();
```

### Phase 3: Application Code Updates

#### 3.1 Database Connection Update
```javascript
// backend/database/connection.js
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Tenant context middleware
export const setTenantContext = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
  if (tenantId) {
    pool.query('SET app.current_tenant_id = $1', [tenantId]);
  }
  next();
};

export default pool;
```

#### 3.2 Updated Query Examples
```javascript
// backend/routes/bookings.js (Updated)
import pool from '../database/connection.js';

// Get bookings with tenant isolation
router.get('/', async (req, res) => {
  try {
    const { room_id, status, start_date, end_date } = req.query;
    
    let query = `
      SELECT b.*, r.name as room_name, r.capacity as room_capacity, r.category as room_category
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.tenant_id = current_tenant_id()
        AND b.deleted_at IS NULL
    `;
    
    const params = [];
    
    if (room_id) {
      query += ' AND b.room_id = $' + (params.length + 1);
      params.push(room_id);
    }
    
    if (status) {
      query += ' AND b.status = $' + (params.length + 1);
      params.push(status);
    }
    
    if (start_date) {
      query += ' AND b.start_time >= $' + (params.length + 1);
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND b.end_time <= $' + (params.length + 1);
      params.push(end_date);
    }
    
    query += ' ORDER BY b.start_time';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});
```

## Backup and Recovery Strategy

### Backup Procedures

#### Daily Automated Backups
```bash
#!/bin/bash
# backup-daily.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_NAME="boom_karaoke_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h localhost -U boom_app -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/boom_karaoke_$DATE.backup"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "boom_karaoke_*.backup" -mtime +30 -delete

echo "Backup completed: boom_karaoke_$DATE.backup"
```

#### Point-in-Time Recovery Setup
```bash
# postgresql.conf settings
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backups/wal_archive/%f'
max_wal_senders = 3
wal_keep_segments = 64

# Create WAL archive directory
mkdir -p /backups/wal_archive
```

### Recovery Procedures

#### Full Database Recovery
```bash
# Stop PostgreSQL service
sudo systemctl stop postgresql

# Restore from backup
pg_restore -h localhost -U boom_app -d boom_karaoke_prod \
  --clean --if-exists \
  /backups/postgresql/boom_karaoke_20241201_120000.backup

# Start PostgreSQL service
sudo systemctl start postgresql
```

#### Point-in-Time Recovery
```bash
# Restore to specific timestamp
pg_basebackup -h localhost -U boom_app -D /var/lib/postgresql/14/recovery \
  --format=tar --wal-method=stream

# Configure recovery.conf
echo "restore_command = 'cp /backups/wal_archive/%f %p'" >> /var/lib/postgresql/14/recovery/recovery.conf
echo "recovery_target_time = '2024-12-01 12:00:00'" >> /var/lib/postgresql/14/recovery/recovery.conf
```

## Monitoring and Maintenance

### Database Monitoring

#### Key Metrics to Monitor
```sql
-- Connection monitoring
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Query performance monitoring
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Table size monitoring
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Automated Maintenance Tasks
```sql
-- Daily VACUUM and ANALYZE
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS void AS $$
BEGIN
  -- Vacuum and analyze all tables
  VACUUM ANALYZE;
  
  -- Update statistics
  ANALYZE;
  
  -- Log maintenance completion
  INSERT INTO maintenance_log (operation, completed_at)
  VALUES ('daily_maintenance', NOW());
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (if available)
SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT daily_maintenance();');
```

## Security Considerations

### Database Security

#### User Management
```sql
-- Create application user with limited permissions
CREATE USER boom_app WITH PASSWORD 'secure_password';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE boom_karaoke_prod TO boom_app;
GRANT USAGE ON SCHEMA public TO boom_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO boom_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO boom_app;

-- Create read-only user for reporting
CREATE USER boom_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE boom_karaoke_prod TO boom_readonly;
GRANT USAGE ON SCHEMA public TO boom_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO boom_readonly;
```

#### SSL Configuration
```bash
# postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'ca.crt'

# pg_hba.conf
hostssl boom_karaoke_prod boom_app 0.0.0.0/0 md5
```

### Data Encryption

#### Encryption at Rest
```bash
# Enable transparent data encryption
# (Requires enterprise PostgreSQL or third-party extensions)
```

#### Encryption in Transit
```bash
# Configure SSL certificates
openssl req -new -x509 -days 365 -nodes -text -out server.crt \
  -keyout server.key -subj "/CN=boom-karaoke-db"
```

## Performance Tuning

### PostgreSQL Configuration

#### Recommended Settings
```conf
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# Connection settings
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'

# Logging
log_statement = 'mod'
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

### Query Optimization

#### Common Query Optimizations
```sql
-- Use prepared statements for repeated queries
PREPARE get_bookings(UUID, TIMESTAMP, TIMESTAMP) AS
  SELECT b.*, r.name as room_name
  FROM bookings b
  JOIN rooms r ON b.room_id = r.id
  WHERE b.tenant_id = $1 
    AND b.start_time >= $2 
    AND b.end_time <= $3
    AND b.deleted_at IS NULL;

-- Use covering indexes for common queries
CREATE INDEX idx_bookings_tenant_date_covering ON bookings(tenant_id, start_time)
INCLUDE (room_id, customer_name, status, total_price);

-- Optimize conflict detection queries
CREATE INDEX idx_bookings_conflict_optimized ON bookings(room_id, start_time, end_time)
WHERE status != 'cancelled' AND deleted_at IS NULL;
```

## Migration Timeline

### Week 1: Preparation
- [ ] Set up PostgreSQL development environment
- [ ] Create schema migration scripts
- [ ] Set up backup and recovery procedures
- [ ] Test migration scripts with sample data

### Week 2: Schema Migration
- [ ] Create production PostgreSQL instance
- [ ] Run schema creation scripts
- [ ] Set up Row-Level Security policies
- [ ] Create indexes and constraints

### Week 3: Data Migration
- [ ] Export data from SQLite
- [ ] Transform data for PostgreSQL format
- [ ] Import data to PostgreSQL
- [ ] Validate data integrity

### Week 4: Application Updates
- [ ] Update database connection code
- [ ] Modify queries for PostgreSQL syntax
- [ ] Update ORM/query builder configurations
- [ ] Test all application functionality

### Week 5: Testing & Deployment
- [ ] Comprehensive testing with PostgreSQL
- [ ] Performance testing and optimization
- [ ] Security testing and hardening
- [ ] Production deployment

### Week 6: Monitoring & Optimization
- [ ] Set up monitoring and alerting
- [ ] Performance tuning and optimization
- [ ] Documentation updates
- [ ] Team training on new system

## Risk Mitigation

### High-Risk Areas
1. **Data Loss During Migration**
   - Mitigation: Multiple backups, staged migration, rollback procedures

2. **Performance Degradation**
   - Mitigation: Performance testing, query optimization, proper indexing

3. **Application Compatibility**
   - Mitigation: Thorough testing, gradual rollout, feature flags

4. **Security Vulnerabilities**
   - Mitigation: Security audit, penetration testing, access controls

### Rollback Procedures
```bash
# Emergency rollback script
#!/bin/bash

# Stop application
sudo systemctl stop boom-karaoke-app

# Restore from SQLite backup
cp /backups/sqlite/database_backup.sqlite /app/data/database.sqlite

# Update application configuration
sed -i 's/PG_HOST=.*/PG_HOST=/' /app/.env
sed -i 's/USE_POSTGRES=.*/USE_POSTGRES=false/' /app/.env

# Start application
sudo systemctl start boom-karaoke-app

echo "Rollback completed - application running on SQLite"
```

## Success Criteria

### Technical Metrics
- [ ] 100% data integrity after migration
- [ ] < 5% performance degradation
- [ ] Zero data loss during migration
- [ ] All existing functionality working

### Business Metrics
- [ ] Zero downtime during migration
- [ ] User experience unchanged
- [ ] All reports and analytics functional
- [ ] Multi-tenancy support operational

### Security Metrics
- [ ] All security policies enforced
- [ ] Data isolation working correctly
- [ ] Audit trails maintained
- [ ] Compliance requirements met

---

*This migration plan provides comprehensive guidance for transitioning from SQLite to PostgreSQL with multi-tenancy support. Follow this plan systematically to ensure a successful migration with minimal risk.*

