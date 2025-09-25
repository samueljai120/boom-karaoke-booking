# Boom Booking SaaS - Development Setup Guide

## 🚀 Quick Start

This guide will help you set up the Boom Booking SaaS development environment with PostgreSQL multi-tenancy.

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 15+ (or Docker)
- **Redis** 7+ (or Docker)
- **Git**

### Option 1: Docker Setup (Recommended)

1. **Start the development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Run the setup script:**
   ```bash
   npm run setup-postgres
   ```

4. **Start the development server:**
   ```bash
   npm run dev:ts
   ```

### Option 2: Local Setup

1. **Install PostgreSQL and Redis locally**

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Run the setup script:**
   ```bash
   npm run setup-postgres
   ```

4. **Start the development server:**
   ```bash
   npm run dev:ts
   ```

## 🗄️ Database Architecture

### Multi-Tenant Schema

The application uses PostgreSQL with Row-Level Security (RLS) for tenant isolation:

- **Tenants Table**: Stores tenant information and settings
- **Users Table**: Global user accounts
- **Tenant Users Table**: Links users to tenants with roles
- **Rooms Table**: Tenant-specific room configurations
- **Bookings Table**: Tenant-specific booking data
- **Business Hours Table**: Tenant-specific operating hours
- **Settings Table**: Tenant-specific configuration
- **Audit Logs Table**: Activity tracking

### Row-Level Security

All tenant-specific tables have RLS enabled with policies that automatically filter data based on the current tenant context.

## 🔧 Development Commands

### Backend Commands

```bash
# Development
npm run dev:ts          # Start TypeScript development server
npm run dev             # Start JavaScript development server
npm run build           # Build TypeScript to JavaScript

# Database
npm run setup-postgres  # Set up PostgreSQL environment
npm run migrate:up      # Run data migration from SQLite
npm run migrate:down    # Rollback migration
npm run db:reset        # Reset database

# Testing
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Frontend Commands

```bash
# Development
npm run dev             # Start Vite development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI
```

## 🌐 Access Points

### Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **WebSocket**: ws://localhost:5000

### Development Tools

- **PgAdmin**: http://localhost:5050
  - Email: admin@boomkaraoke.com
  - Password: admin123
- **Redis Commander**: http://localhost:8081

### Database Connection

- **Host**: localhost
- **Port**: 5432
- **Database**: boom_booking
- **Username**: postgres
- **Password**: password

## 📊 Default Data

The setup creates a default tenant with:

- **Tenant**: Demo Karaoke (subdomain: demo)
- **Admin User**: demo@example.com / demo123
- **Rooms**: 3 sample rooms (A, B, C)
- **Business Hours**: 10 AM - 10 PM, 7 days a week
- **Settings**: Default configuration

## 🔐 Authentication

### Current Implementation
- Basic JWT authentication
- Password hashing with bcrypt
- Session management

### Planned Implementation
- OAuth2 integration (Google, Microsoft)
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Refresh token mechanism

## 🏗️ Architecture Overview

### Current Stack
- **Frontend**: React 18.2.0 + Vite
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL 15+ with RLS
- **Cache**: Redis 7+
- **Real-time**: Socket.IO with Redis adapter

### Target Stack (In Progress)
- **Frontend**: Next.js 14+ + TypeScript
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL with multi-tenancy
- **Cache**: Redis Cluster
- **Orchestration**: Kubernetes (EKS)
- **Monitoring**: Prometheus + Grafana

## 🧪 Testing

### Test Structure
- **Unit Tests**: Component and function testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Critical user journey testing

### Running Tests
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# All tests
npm run test:all
```

## 📝 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for code quality
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Git Workflow
1. Create feature branch from `main`
2. Make changes with tests
3. Run tests and linting
4. Create pull request
5. Code review and merge

### Database Migrations
- Use migration scripts for schema changes
- Always test migrations on development first
- Keep migrations reversible when possible

## 🐛 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose -f docker-compose.dev.yml ps
   
   # Restart PostgreSQL
   docker-compose -f docker-compose.dev.yml restart postgres
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis status
   docker-compose -f docker-compose.dev.yml logs redis
   
   # Restart Redis
   docker-compose -f docker-compose.dev.yml restart redis
   ```

3. **Migration Errors**
   ```bash
   # Reset database
   npm run db:reset
   
   # Check migration logs
   cat backend/migration-report.json
   ```

4. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

### Logs

- **Application Logs**: Check console output
- **Database Logs**: `docker-compose -f docker-compose.dev.yml logs postgres`
- **Redis Logs**: `docker-compose -f docker-compose.dev.yml logs redis`

## 📚 Additional Resources

### Documentation
- [Development Status](./DEVELOPMENT_STATUS.md)
- [Architecture Overview](../Application%20Overview%20Documentations/architecture-overview.md)
- [API Documentation](./backend/docs/api.md)

### External Links
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Read the [Development Status](./DEVELOPMENT_STATUS.md)
2. Check the [TODO List](./DEVELOPMENT_STATUS.md#current-issues--bugs)
3. Follow the coding standards
4. Write tests for new features
5. Update documentation

## 📞 Support

For development issues:
1. Check this guide first
2. Review the troubleshooting section
3. Check the development status document
4. Create an issue with detailed information

---

*This setup guide is part of the Boom Booking SaaS transformation project. For the complete development plan, see the [Scale Up Plan](../Scale%20Up%20Plan/) directory.*

