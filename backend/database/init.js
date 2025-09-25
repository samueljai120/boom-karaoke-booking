import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || './data/database.sqlite';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH);

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Rooms table
      db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          capacity INTEGER NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          price_per_hour DECIMAL(10,2) DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
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
        )
      `);

      // Business hours table
      db.run(`
        CREATE TABLE IF NOT EXISTS business_hours (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day_of_week INTEGER NOT NULL,
          open_time TEXT NOT NULL,
          close_time TEXT NOT NULL,
          is_closed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Notifications table
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'info',
          data TEXT,
          read_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Security activity table
      db.run(`
        CREATE TABLE IF NOT EXISTS security_activity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          user_id INTEGER,
          ip_address TEXT,
          user_agent TEXT,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Data deletion requests table
      db.run(`
        CREATE TABLE IF NOT EXISTS data_deletion_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          reason TEXT,
          status TEXT DEFAULT 'pending',
          requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          processed_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Insert default data
      insertDefaultData()
        .then(() => {
          // console.log (removed for clean version)('✅ Database tables created successfully');
          resolve();
        })
        .catch(reject);
    });
  });
}

async function insertDefaultData() {
  return new Promise((resolve, reject) => {
    // Check if data already exists
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        // console.log (removed for clean version)('📊 Default data already exists, skipping...');
        resolve();
        return;
      }

      // console.log (removed for clean version)('📊 Inserting default data...');

      // Insert default user
      const hashedPassword = bcrypt.hashSync('demo123', 10);
      
      db.run(`
        INSERT INTO users (email, password, name, role) 
        VALUES (?, ?, ?, ?)
      `, ['demo@example.com', hashedPassword, 'Demo User', 'admin']);

      // Insert default rooms
      const rooms = [
        ['Room A', 4, 'Standard', 'Standard karaoke room for small groups', 25.00],
        ['Room B', 6, 'Premium', 'Premium room with better sound system', 35.00],
        ['Room C', 8, 'VIP', 'VIP room with luxury amenities', 50.00]
      ];

      rooms.forEach(room => {
        db.run(`
          INSERT INTO rooms (name, capacity, category, description, price_per_hour) 
          VALUES (?, ?, ?, ?, ?)
        `, room);
      });

      // Insert default business hours (Monday-Sunday, 10 AM - 10 PM)
      for (let day = 0; day < 7; day++) {
        db.run(`
          INSERT INTO business_hours (day_of_week, open_time, close_time) 
          VALUES (?, ?, ?)
        `, [day, '10:00', '22:00']);
      }

      // Insert default settings
      const settings = [
        ['app_name', 'Boom Karaoke'],
        ['timezone', 'America/New_York'],
        ['currency', 'USD'],
        ['booking_advance_days', '30'],
        ['booking_min_duration', '60'],
        ['booking_max_duration', '480']
      ];

      settings.forEach(setting => {
        db.run(`
          INSERT INTO settings (key, value) 
          VALUES (?, ?)
        `, setting);
      });

      // Insert sample bookings
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const sampleBookings = [
        [1, 'John Doe', 'john@example.com', '555-0123', 
         new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000).toISOString(),
         new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000).toISOString(),
         'confirmed', 'Birthday party', 50.00],
        [2, 'Jane Smith', 'jane@example.com', '555-0456',
         new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000).toISOString(),
         new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000).toISOString(),
         'confirmed', 'Corporate event', 70.00],
        [3, 'Mike Johnson', 'mike@example.com', '555-0789',
         new Date(tomorrow.getTime() + 18 * 60 * 60 * 1000).toISOString(),
         new Date(tomorrow.getTime() + 20 * 60 * 60 * 1000).toISOString(),
         'confirmed', 'Date night', 100.00]
      ];

      sampleBookings.forEach(booking => {
        db.run(`
          INSERT INTO bookings (room_id, customer_name, customer_email, customer_phone, 
                              start_time, end_time, status, notes, total_price) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, booking);
      });

      // console.log (removed for clean version)('✅ Default data inserted successfully');
      resolve();
    });
  });
}

export default db;

