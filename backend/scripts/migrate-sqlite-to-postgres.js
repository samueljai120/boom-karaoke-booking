import sqlite3 from 'sqlite3';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configurations
const sqliteDb = new sqlite3.Database('./data/database.sqlite');
const postgresClient = new Client({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'boom_booking',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Migration configuration
const MIGRATION_CONFIG = {
  // Default tenant configuration
  defaultTenant: {
    name: 'Migrated Karaoke Business',
    subdomain: 'migrated',
    plan_type: 'professional',
    status: 'active',
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      booking_advance_days: 30,
      booking_min_duration: 60,
      booking_max_duration: 480
    }
  },
  
  // Field mappings
  fieldMappings: {
    users: {
      id: 'id',
      email: 'email',
      password: 'password',
      name: 'name',
      role: 'role',
      created_at: 'created_at',
      updated_at: 'updated_at'
    },
    rooms: {
      id: 'id',
      name: 'name',
      capacity: 'capacity',
      category: 'category',
      description: 'description',
      price_per_hour: 'price_per_hour',
      is_active: 'is_active',
      created_at: 'created_at',
      updated_at: 'updated_at'
    },
    bookings: {
      id: 'id',
      room_id: 'room_id',
      customer_name: 'customer_name',
      customer_email: 'customer_email',
      customer_phone: 'customer_phone',
      start_time: 'start_time',
      end_time: 'end_time',
      status: 'status',
      notes: 'notes',
      total_price: 'total_price',
      created_at: 'created_at',
      updated_at: 'updated_at'
    },
    business_hours: {
      id: 'id',
      day_of_week: 'day_of_week',
      open_time: 'open_time',
      close_time: 'close_time',
      is_closed: 'is_closed',
      created_at: 'created_at',
      updated_at: 'updated_at'
    },
    settings: {
      id: 'id',
      key: 'key',
      value: 'value',
      created_at: 'created_at',
      updated_at: 'updated_at'
    }
  }
};

class DataMigration {
  constructor() {
    this.tenantId = null;
    this.userIdMappings = new Map();
    this.roomIdMappings = new Map();
    this.bookingIdMappings = new Map();
    this.businessHoursIdMappings = new Map();
    this.settingsIdMappings = new Map();
  }

  async start() {
    try {
      console.log('🚀 Starting SQLite to PostgreSQL migration...');
      
      // Connect to PostgreSQL
      await postgresClient.connect();
      console.log('✅ Connected to PostgreSQL');
      
      // Create default tenant
      await this.createDefaultTenant();
      
      // Migrate data tables
      await this.migrateUsers();
      await this.migrateRooms();
      await this.migrateBusinessHours();
      await this.migrateSettings();
      await this.migrateBookings();
      
      // Create tenant-user relationships
      await this.createTenantUserRelationships();
      
      console.log('✅ Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await postgresClient.end();
      sqliteDb.close();
    }
  }

  async createDefaultTenant() {
    console.log('📊 Creating default tenant...');
    
    const { name, subdomain, plan_type, status, settings } = MIGRATION_CONFIG.defaultTenant;
    
    const result = await postgresClient.query(`
      INSERT INTO tenants (name, subdomain, plan_type, status, settings)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [name, subdomain, plan_type, status, JSON.stringify(settings)]);
    
    this.tenantId = result.rows[0].id;
    console.log(`✅ Default tenant created with ID: ${this.tenantId}`);
  }

  async migrateUsers() {
    console.log('👥 Migrating users...');
    
    return new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', async (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          for (const user of rows) {
            const result = await postgresClient.query(`
              INSERT INTO users (id, email, password, name, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                password = EXCLUDED.password,
                name = EXCLUDED.name,
                updated_at = EXCLUDED.updated_at
              RETURNING id
            `, [
              user.id,
              user.email,
              user.password,
              user.name,
              user.created_at,
              user.updated_at
            ]);
            
            this.userIdMappings.set(user.id, result.rows[0].id);
          }
          
          console.log(`✅ Migrated ${rows.length} users`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async migrateRooms() {
    console.log('🏠 Migrating rooms...');
    
    return new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM rooms', async (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          for (const room of rows) {
            const result = await postgresClient.query(`
              INSERT INTO rooms (id, tenant_id, name, capacity, category, description, price_per_hour, is_active, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                capacity = EXCLUDED.capacity,
                category = EXCLUDED.category,
                description = EXCLUDED.description,
                price_per_hour = EXCLUDED.price_per_hour,
                is_active = EXCLUDED.is_active,
                updated_at = EXCLUDED.updated_at
              RETURNING id
            `, [
              room.id,
              this.tenantId,
              room.name,
              room.capacity,
              room.category,
              room.description,
              room.price_per_hour,
              room.is_active,
              room.created_at,
              room.updated_at
            ]);
            
            this.roomIdMappings.set(room.id, result.rows[0].id);
          }
          
          console.log(`✅ Migrated ${rows.length} rooms`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async migrateBusinessHours() {
    console.log('🕒 Migrating business hours...');
    
    return new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM business_hours', async (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          for (const businessHour of rows) {
            const result = await postgresClient.query(`
              INSERT INTO business_hours (id, tenant_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              ON CONFLICT (id) DO UPDATE SET
                day_of_week = EXCLUDED.day_of_week,
                open_time = EXCLUDED.open_time,
                close_time = EXCLUDED.close_time,
                is_closed = EXCLUDED.is_closed,
                updated_at = EXCLUDED.updated_at
              RETURNING id
            `, [
              businessHour.id,
              this.tenantId,
              businessHour.day_of_week,
              businessHour.open_time,
              businessHour.close_time,
              businessHour.is_closed,
              businessHour.created_at,
              businessHour.updated_at
            ]);
            
            this.businessHoursIdMappings.set(businessHour.id, result.rows[0].id);
          }
          
          console.log(`✅ Migrated ${rows.length} business hours`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async migrateSettings() {
    console.log('⚙️ Migrating settings...');
    
    return new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM settings', async (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          for (const setting of rows) {
            const result = await postgresClient.query(`
              INSERT INTO settings (id, tenant_id, key, value, type, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (tenant_id, key) DO UPDATE SET
                value = EXCLUDED.value,
                updated_at = EXCLUDED.updated_at
              RETURNING id
            `, [
              setting.id,
              this.tenantId,
              setting.key,
              setting.value,
              'string', // Default type
              setting.created_at,
              setting.updated_at
            ]);
            
            this.settingsIdMappings.set(setting.id, result.rows[0].id);
          }
          
          console.log(`✅ Migrated ${rows.length} settings`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async migrateBookings() {
    console.log('📅 Migrating bookings...');
    
    return new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM bookings', async (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          for (const booking of rows) {
            // Map room_id to new UUID
            const newRoomId = this.roomIdMappings.get(booking.room_id);
            if (!newRoomId) {
              console.warn(`⚠️ Room ID ${booking.room_id} not found in mappings, skipping booking ${booking.id}`);
              continue;
            }

            const result = await postgresClient.query(`
              INSERT INTO bookings (id, tenant_id, room_id, customer_name, customer_email, customer_phone, start_time, end_time, status, notes, total_price, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
              ON CONFLICT (id) DO UPDATE SET
                customer_name = EXCLUDED.customer_name,
                customer_email = EXCLUDED.customer_email,
                customer_phone = EXCLUDED.customer_phone,
                start_time = EXCLUDED.start_time,
                end_time = EXCLUDED.end_time,
                status = EXCLUDED.status,
                notes = EXCLUDED.notes,
                total_price = EXCLUDED.total_price,
                updated_at = EXCLUDED.updated_at
              RETURNING id
            `, [
              booking.id,
              this.tenantId,
              newRoomId,
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
            
            this.bookingIdMappings.set(booking.id, result.rows[0].id);
          }
          
          console.log(`✅ Migrated ${rows.length} bookings`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async createTenantUserRelationships() {
    console.log('🔗 Creating tenant-user relationships...');
    
    try {
      // Get all users and create tenant relationships
      for (const [oldUserId, newUserId] of this.userIdMappings) {
        await postgresClient.query(`
          INSERT INTO tenant_users (tenant_id, user_id, role, permissions)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (tenant_id, user_id) DO NOTHING
        `, [
          this.tenantId,
          newUserId,
          'admin', // Default all migrated users to admin
          JSON.stringify({ all: true })
        ]);
      }
      
      console.log(`✅ Created ${this.userIdMappings.size} tenant-user relationships`);
    } catch (error) {
      console.error('❌ Failed to create tenant-user relationships:', error);
      throw error;
    }
  }

  // Generate migration report
  async generateReport() {
    const report = {
      migration_date: new Date().toISOString(),
      tenant_id: this.tenantId,
      statistics: {
        users: this.userIdMappings.size,
        rooms: this.roomIdMappings.size,
        bookings: this.bookingIdMappings.size,
        business_hours: this.businessHoursIdMappings.size,
        settings: this.settingsIdMappings.size
      },
      mappings: {
        users: Object.fromEntries(this.userIdMappings),
        rooms: Object.fromEntries(this.roomIdMappings),
        bookings: Object.fromEntries(this.bookingIdMappings),
        business_hours: Object.fromEntries(this.businessHoursIdMappings),
        settings: Object.fromEntries(this.settingsIdMappings)
      }
    };

    const reportPath = path.join(__dirname, '../migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Migration report saved to: ${reportPath}`);
    
    return report;
  }
}

// Run migration
async function runMigration() {
  const migration = new DataMigration();
  
  try {
    await migration.start();
    await migration.generateReport();
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { DataMigration, runMigration };


