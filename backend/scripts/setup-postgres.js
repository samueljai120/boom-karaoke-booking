#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

class PostgreSQLSetup {
  constructor() {
    this.postgresConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'boom_booking',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password'
    };
  }

  async setup() {
    try {
      console.log('🚀 Setting up PostgreSQL for Boom Booking SaaS...');
      
      // Check if PostgreSQL is installed
      await this.checkPostgreSQLInstallation();
      
      // Create database if it doesn't exist
      await this.createDatabase();
      
      // Install dependencies
      await this.installDependencies();
      
      // Initialize multi-tenant schema
      await this.initializeSchema();
      
      // Run migration if SQLite data exists
      await this.runMigrationIfNeeded();
      
      console.log('✅ PostgreSQL setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Update your .env file with PostgreSQL credentials');
      console.log('2. Run: npm run dev:ts (for TypeScript development)');
      console.log('3. Run: npm run test (to run tests)');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkPostgreSQLInstallation() {
    console.log('🔍 Checking PostgreSQL installation...');
    
    try {
      execSync('psql --version', { stdio: 'pipe' });
      console.log('✅ PostgreSQL is installed');
    } catch (error) {
      console.error('❌ PostgreSQL is not installed or not in PATH');
      console.log('\n📋 Please install PostgreSQL:');
      console.log('• macOS: brew install postgresql');
      console.log('• Ubuntu: sudo apt-get install postgresql postgresql-contrib');
      console.log('• Windows: Download from https://www.postgresql.org/download/');
      throw new Error('PostgreSQL not found');
    }
  }

  async createDatabase() {
    console.log('🗄️ Creating database...');
    
    try {
      // Connect to postgres database to create our database
      const createDbCommand = `psql -h ${this.postgresConfig.host} -p ${this.postgresConfig.port} -U ${this.postgresConfig.user} -d postgres -c "CREATE DATABASE ${this.postgresConfig.database};"`;
      
      execSync(createDbCommand, { 
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: this.postgresConfig.password }
      });
      
      console.log(`✅ Database '${this.postgresConfig.database}' created successfully`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`📊 Database '${this.postgresConfig.database}' already exists`);
      } else {
        console.error('❌ Failed to create database:', error.message);
        throw error;
      }
    }
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      execSync('npm install', { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message);
      throw error;
    }
  }

  async initializeSchema() {
    console.log('🏗️ Initializing multi-tenant schema...');
    
    try {
      const { initMultiTenantDatabase, createDefaultTenant } = await import('../database/postgres.js');
      
      // Initialize schema
      await initMultiTenantDatabase();
      
      // Create default tenant
      await createDefaultTenant();
      
      console.log('✅ Multi-tenant schema initialized');
    } catch (error) {
      console.error('❌ Failed to initialize schema:', error.message);
      throw error;
    }
  }

  async runMigrationIfNeeded() {
    const sqlitePath = path.join(__dirname, '../data/database.sqlite');
    
    if (fs.existsSync(sqlitePath)) {
      console.log('📊 SQLite database found, running migration...');
      
      try {
        const { runMigration } = await import('./migrate-sqlite-to-postgres.js');
        await runMigration();
        console.log('✅ Migration completed successfully');
      } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.log('⚠️ You can run the migration manually later with: npm run migrate:up');
      }
    } else {
      console.log('📊 No SQLite database found, skipping migration');
    }
  }

  // Generate environment file
  generateEnvFile() {
    console.log('📝 Generating environment file...');
    
    const envContent = `# Server Configuration
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Database Configuration
# SQLite (Legacy)
DB_PATH=./data/database.sqlite

# PostgreSQL (New Multi-tenant)
POSTGRES_HOST=${this.postgresConfig.host}
POSTGRES_PORT=${this.postgresConfig.port}
POSTGRES_DB=${this.postgresConfig.database}
POSTGRES_USER=${this.postgresConfig.user}
POSTGRES_PASSWORD=${this.postgresConfig.password}
POSTGRES_SSL=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth2 Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@boomkaraoke.com

# AI Configuration
OPENAI_API_KEY=your-openai-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Business Configuration
DEFAULT_TIMEZONE=America/New_York
DEFAULT_CURRENCY=USD
BOOKING_ADVANCE_DAYS=30
BOOKING_MIN_DURATION=60
BOOKING_MAX_DURATION=480
`;

    const envPath = path.join(__dirname, '../.env');
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Environment file created: ${envPath}`);
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new PostgreSQLSetup();
  setup.setup();
}

export { PostgreSQLSetup };


