# Testing Strategy: Quality Assurance & Testing Procedures

## Executive Summary

**Lead**: Marcus Rodriguez (Fullstack Engineer) + Raj Patel (DevOps Engineer)  
**Timeline**: 14 weeks (integrated throughout development)  
**Goal**: Ensure high-quality, reliable SaaS platform with comprehensive test coverage

---

## Testing Philosophy & Principles

### Quality Assurance Principles
1. **Shift-Left Testing**: Test early and often in the development cycle
2. **Test-Driven Development**: Write tests before implementing features
3. **Continuous Testing**: Automated testing in CI/CD pipeline
4. **Risk-Based Testing**: Focus on high-risk, high-impact areas
5. **User-Centric Testing**: Test from user perspective and real-world scenarios

### Testing Pyramid Strategy
```
        /\
       /  \     E2E Tests (5%)
      /____\    - Critical user journeys
     /      \   - Cross-browser testing
    /        \  - Performance testing
   /__________\ 
  Integration Tests (25%)
  - API testing
  - Database testing
  - Service integration
  /________________\
 Unit Tests (70%)
 - Component testing
 - Function testing
 - Business logic testing
```

---

## Testing Framework & Tools

### Frontend Testing Stack
```javascript
// Jest + React Testing Library + Cypress
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "cypress": "^12.7.0",
    "cypress-real-events": "^1.7.0",
    "cypress-axe": "^1.0.0",
    "msw": "^1.0.0"
  }
}
```

### Backend Testing Stack
```javascript
// Jest + Supertest + Testcontainers
{
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "testcontainers": "^9.7.0",
    "mongodb-memory-server": "^8.12.0",
    "redis-mock": "^0.56.3"
  }
}
```

### API Testing Stack
```yaml
# Newman + Postman Collections
newman: "^6.0.0"
postman-collection: "^4.1.0"
```

---

## Unit Testing Strategy

### Frontend Component Testing
```javascript
// React component testing example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingModal } from '../BookingModal';

describe('BookingModal', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    booking: null
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders booking form with required fields', () => {
    render(<BookingModal {...defaultProps} />);
    
    expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/room/i)).toBeInTheDocument();
  });
  
  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(<BookingModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /create booking/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/customer name is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    const bookingData = {
      customerName: 'John Doe',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T12:00:00Z',
      roomId: '1'
    };
    
    render(<BookingModal {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/customer name/i), bookingData.customerName);
    await user.type(screen.getByLabelText(/start time/i), bookingData.startTime);
    await user.type(screen.getByLabelText(/end time/i), bookingData.endTime);
    await user.selectOptions(screen.getByLabelText(/room/i), bookingData.roomId);
    
    const submitButton = screen.getByRole('button', { name: /create booking/i });
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(bookingData);
  });
  
  test('handles time conflict errors', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error('Time slot conflicts with existing booking'));
    
    render(<BookingModal {...defaultProps} />);
    
    // Fill form and submit
    await user.type(screen.getByLabelText(/customer name/i), 'John Doe');
    await user.type(screen.getByLabelText(/start time/i), '2024-01-15T10:00:00Z');
    await user.type(screen.getByLabelText(/end time/i), '2024-01-15T12:00:00Z');
    await user.selectOptions(screen.getByLabelText(/room/i), '1');
    
    const submitButton = screen.getByRole('button', { name: /create booking/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/time slot conflicts with existing booking/i)).toBeInTheDocument();
    });
  });
});
```

### Backend API Testing
```javascript
// API endpoint testing
import request from 'supertest';
import { app } from '../server';
import { db } from '../database/connection';

describe('POST /api/bookings', () => {
  beforeEach(async () => {
    // Clean database before each test
    await db.query('DELETE FROM bookings');
    await db.query('DELETE FROM rooms');
    
    // Insert test room
    await db.query(
      'INSERT INTO rooms (id, name, capacity, price_per_hour) VALUES (?, ?, ?, ?)',
      [1, 'Room A', 4, 25.00]
    );
  });
  
  test('creates booking with valid data', async () => {
    const bookingData = {
      room_id: 1,
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      start_time: '2024-01-15T10:00:00Z',
      end_time: '2024-01-15T12:00:00Z'
    };
    
    const response = await request(app)
      .post('/api/bookings')
      .send(bookingData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.customer_name).toBe('John Doe');
    expect(response.body.data.total_price).toBe(50.00);
  });
  
  test('rejects booking with time conflict', async () => {
    // Create existing booking
    await db.query(
      'INSERT INTO bookings (room_id, customer_name, start_time, end_time, total_price) VALUES (?, ?, ?, ?, ?)',
      [1, 'Jane Doe', '2024-01-15T10:00:00Z', '2024-01-15T12:00:00Z', 50.00]
    );
    
    const conflictingBooking = {
      room_id: 1,
      customer_name: 'John Doe',
      start_time: '2024-01-15T11:00:00Z',
      end_time: '2024-01-15T13:00:00Z'
    };
    
    const response = await request(app)
      .post('/api/bookings')
      .send(conflictingBooking)
      .expect(400);
    
    expect(response.body.error).toContain('Time slot conflicts');
  });
  
  test('validates required fields', async () => {
    const invalidBooking = {
      customer_name: 'John Doe'
      // Missing required fields
    };
    
    const response = await request(app)
      .post('/api/bookings')
      .send(invalidBooking)
      .expect(400);
    
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
```

### Business Logic Testing
```javascript
// Business logic unit tests
import { calculateBookingPrice, validateBusinessHours, checkTimeConflicts } from '../utils/bookingLogic';

describe('Booking Logic', () => {
  describe('calculateBookingPrice', () => {
    test('calculates price correctly for 2-hour booking', () => {
      const startTime = new Date('2024-01-15T10:00:00Z');
      const endTime = new Date('2024-01-15T12:00:00Z');
      const pricePerHour = 25.00;
      
      const result = calculateBookingPrice(startTime, endTime, pricePerHour);
      
      expect(result.durationHours).toBe(2);
      expect(result.totalPrice).toBe(50.00);
    });
    
    test('rounds up to nearest 15-minute increment', () => {
      const startTime = new Date('2024-01-15T10:00:00Z');
      const endTime = new Date('2024-01-15T11:45:00Z');
      const pricePerHour = 25.00;
      
      const result = calculateBookingPrice(startTime, endTime, pricePerHour);
      
      expect(result.durationHours).toBe(2); // Rounded up from 1.75
      expect(result.totalPrice).toBe(50.00);
    });
  });
  
  describe('validateBusinessHours', () => {
    const businessHours = [
      { day_of_week: 1, open_time: '10:00', close_time: '22:00', is_closed: false },
      { day_of_week: 2, open_time: '10:00', close_time: '22:00', is_closed: false }
    ];
    
    test('validates booking within business hours', () => {
      const bookingTime = new Date('2024-01-15T14:00:00Z'); // Monday 2 PM
      
      const result = validateBusinessHours(bookingTime, businessHours);
      
      expect(result.isValid).toBe(true);
    });
    
    test('rejects booking outside business hours', () => {
      const bookingTime = new Date('2024-01-15T23:00:00Z'); // Monday 11 PM
      
      const result = validateBusinessHours(bookingTime, businessHours);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('outside business hours');
    });
  });
  
  describe('checkTimeConflicts', () => {
    const existingBookings = [
      {
        id: 1,
        room_id: 1,
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T12:00:00Z'
      }
    ];
    
    test('detects overlapping bookings', () => {
      const newBooking = {
        room_id: 1,
        start_time: '2024-01-15T11:00:00Z',
        end_time: '2024-01-15T13:00:00Z'
      };
      
      const hasConflict = checkTimeConflicts(newBooking, existingBookings);
      
      expect(hasConflict).toBe(true);
    });
    
    test('allows non-overlapping bookings', () => {
      const newBooking = {
        room_id: 1,
        start_time: '2024-01-15T13:00:00Z',
        end_time: '2024-01-15T15:00:00Z'
      };
      
      const hasConflict = checkTimeConflicts(newBooking, existingBookings);
      
      expect(hasConflict).toBe(false);
    });
  });
});
```

---

## Integration Testing Strategy

### API Integration Testing
```javascript
// Full API integration tests
import request from 'supertest';
import { app } from '../server';
import { setupTestDatabase, cleanupTestDatabase } from '../test-utils/database';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  describe('Authentication Flow', () => {
    test('complete login and protected route access', async () => {
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
        .expect(201);
      
      const { token } = registerResponse.body;
      
      // Access protected route
      const bookingsResponse = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(bookingsResponse.body.success).toBe(true);
    });
  });
  
  describe('Booking Workflow', () => {
    test('complete booking creation and management', async () => {
      // Create room
      const roomResponse = await request(app)
        .post('/api/rooms')
        .send({
          name: 'Test Room',
          capacity: 4,
          price_per_hour: 25.00
        })
        .expect(201);
      
      const roomId = roomResponse.body.data.id;
      
      // Create booking
      const bookingResponse = await request(app)
        .post('/api/bookings')
        .send({
          room_id: roomId,
          customer_name: 'John Doe',
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T12:00:00Z'
        })
        .expect(201);
      
      const bookingId = bookingResponse.body.data.id;
      
      // Update booking
      const updateResponse = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .send({
          customer_name: 'Jane Doe'
        })
        .expect(200);
      
      expect(updateResponse.body.data.customer_name).toBe('Jane Doe');
      
      // Cancel booking
      const cancelResponse = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .expect(200);
      
      expect(cancelResponse.body.data.status).toBe('cancelled');
    });
  });
});
```

### Database Integration Testing
```javascript
// Database integration tests with Testcontainers
import { GenericContainer } from 'testcontainers';
import { Pool } from 'pg';

describe('Database Integration', () => {
  let container;
  let pool;
  
  beforeAll(async () => {
    // Start PostgreSQL container
    container = await new GenericContainer('postgres:15')
      .withEnvironment({
        POSTGRES_DB: 'test_db',
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password'
      })
      .withExposedPorts(5432)
      .start();
    
    // Create connection pool
    pool = new Pool({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: 'test_db',
      user: 'test_user',
      password: 'test_password'
    });
    
    // Run migrations
    await runMigrations(pool);
  });
  
  afterAll(async () => {
    await pool.end();
    await container.stop();
  });
  
  beforeEach(async () => {
    // Clean database before each test
    await pool.query('TRUNCATE TABLE bookings, rooms, users CASCADE');
  });
  
  test('booking creation with database constraints', async () => {
    // Insert test data
    await pool.query(
      'INSERT INTO rooms (id, name, capacity, price_per_hour) VALUES ($1, $2, $3, $4)',
      [1, 'Room A', 4, 25.00]
    );
    
    // Create booking
    const result = await pool.query(
      'INSERT INTO bookings (room_id, customer_name, start_time, end_time, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [1, 'John Doe', '2024-01-15T10:00:00Z', '2024-01-15T12:00:00Z', 50.00]
    );
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].customer_name).toBe('John Doe');
  });
  
  test('foreign key constraints work correctly', async () => {
    // Try to create booking with non-existent room
    await expect(
      pool.query(
        'INSERT INTO bookings (room_id, customer_name, start_time, end_time, total_price) VALUES ($1, $2, $3, $4, $5)',
        [999, 'John Doe', '2024-01-15T10:00:00Z', '2024-01-15T12:00:00Z', 50.00]
      )
    ).rejects.toThrow('foreign key constraint');
  });
});
```

---

## End-to-End Testing Strategy

### Cypress E2E Tests
```javascript
// Cypress E2E test example
describe('Booking Management E2E', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Login
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for dashboard to load
    cy.get('[data-testid="dashboard"]').should('be.visible');
  });
  
  it('creates a new booking', () => {
    // Click create booking button
    cy.get('[data-testid="create-booking-button"]').click();
    
    // Fill booking form
    cy.get('[data-testid="customer-name-input"]').type('John Doe');
    cy.get('[data-testid="customer-email-input"]').type('john@example.com');
    cy.get('[data-testid="start-time-input"]').type('2024-01-15T10:00');
    cy.get('[data-testid="end-time-input"]').type('2024-01-15T12:00');
    cy.get('[data-testid="room-select"]').select('Room A');
    
    // Submit form
    cy.get('[data-testid="submit-booking-button"]').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('contain', 'Booking created successfully');
    
    // Verify booking appears in calendar
    cy.get('[data-testid="booking-item"]').should('contain', 'John Doe');
  });
  
  it('handles booking conflicts', () => {
    // Create first booking
    cy.get('[data-testid="create-booking-button"]').click();
    cy.get('[data-testid="customer-name-input"]').type('Jane Doe');
    cy.get('[data-testid="start-time-input"]').type('2024-01-15T10:00');
    cy.get('[data-testid="end-time-input"]').type('2024-01-15T12:00');
    cy.get('[data-testid="room-select"]').select('Room A');
    cy.get('[data-testid="submit-booking-button"]').click();
    
    // Wait for success
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Try to create conflicting booking
    cy.get('[data-testid="create-booking-button"]').click();
    cy.get('[data-testid="customer-name-input"]').type('John Doe');
    cy.get('[data-testid="start-time-input"]').type('2024-01-15T11:00');
    cy.get('[data-testid="end-time-input"]').type('2024-01-15T13:00');
    cy.get('[data-testid="room-select"]').select('Room A');
    cy.get('[data-testid="submit-booking-button"]').click();
    
    // Verify conflict error
    cy.get('[data-testid="error-message"]').should('contain', 'Time slot conflicts');
  });
  
  it('updates existing booking', () => {
    // Create booking first
    cy.get('[data-testid="create-booking-button"]').click();
    cy.get('[data-testid="customer-name-input"]').type('John Doe');
    cy.get('[data-testid="start-time-input"]').type('2024-01-15T10:00');
    cy.get('[data-testid="end-time-input"]').type('2024-01-15T12:00');
    cy.get('[data-testid="room-select"]').select('Room A');
    cy.get('[data-testid="submit-booking-button"]').click();
    
    // Wait for success
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Click on booking to edit
    cy.get('[data-testid="booking-item"]').first().click();
    
    // Update customer name
    cy.get('[data-testid="customer-name-input"]').clear().type('Jane Doe');
    cy.get('[data-testid="save-booking-button"]').click();
    
    // Verify update
    cy.get('[data-testid="success-message"]').should('contain', 'Booking updated successfully');
    cy.get('[data-testid="booking-item"]').should('contain', 'Jane Doe');
  });
});
```

### Cross-Browser Testing
```javascript
// Cross-browser test configuration
const browsers = ['chrome', 'firefox', 'safari', 'edge'];

browsers.forEach(browser => {
  describe(`Booking Management - ${browser}`, () => {
    beforeEach(() => {
      cy.visit('/', {
        browser: browser
      });
    });
    
    it('creates booking successfully', () => {
      // Test booking creation across browsers
      cy.get('[data-testid="create-booking-button"]').click();
      cy.get('[data-testid="customer-name-input"]').type('John Doe');
      cy.get('[data-testid="submit-booking-button"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });
});
```

---

## Performance Testing Strategy

### Load Testing with Artillery
```yaml
# artillery-load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Create booking"
    weight: 40
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      - post:
          url: "/api/bookings"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            room_id: 1
            customer_name: "Load Test User"
            start_time: "2024-01-15T10:00:00Z"
            end_time: "2024-01-15T12:00:00Z"

  - name: "Get bookings"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/api/bookings"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Get rooms"
    weight: 30
    flow:
      - get:
          url: "/api/rooms"
```

### Performance Benchmarks
```javascript
// Performance test configuration
const performanceConfig = {
  // Response time targets
  apiResponseTime: 200, // ms (95th percentile)
  pageLoadTime: 2000,   // ms (First Contentful Paint)
  databaseQueryTime: 50, // ms (average)
  
  // Throughput targets
  requestsPerSecond: 100,
  concurrentUsers: 1000,
  
  // Resource usage targets
  memoryUsage: 512, // MB
  cpuUsage: 70,     // %
  
  // Error rate targets
  errorRate: 0.1,   // %
  availability: 99.9 // %
};

// Performance test implementation
describe('Performance Tests', () => {
  test('API response time under load', async () => {
    const startTime = Date.now();
    
    // Simulate 100 concurrent requests
    const promises = Array(100).fill().map(() => 
      request(app).get('/api/bookings')
    );
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const avgResponseTime = (endTime - startTime) / 100;
    
    expect(avgResponseTime).toBeLessThan(performanceConfig.apiResponseTime);
    
    // Check all requests succeeded
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
  
  test('database query performance', async () => {
    const startTime = Date.now();
    
    // Execute complex query
    const result = await db.query(`
      SELECT b.*, r.name as room_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.start_time >= $1 AND b.end_time <= $2
      ORDER BY b.start_time
    `, ['2024-01-01', '2024-12-31']);
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    expect(queryTime).toBeLessThan(performanceConfig.databaseQueryTime);
    expect(result.rows).toBeDefined();
  });
});
```

---

## Security Testing Strategy

### Authentication & Authorization Testing
```javascript
// Security test suite
describe('Security Tests', () => {
  describe('Authentication', () => {
    test('rejects requests without valid token', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(401);
      
      expect(response.body.error).toContain('Access token required');
    });
    
    test('rejects requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(response.body.error).toContain('Invalid or expired token');
    });
    
    test('rate limits login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong-password'
      };
      
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);
      }
      
      // Next attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(429);
      
      expect(response.body.error).toContain('Too many requests');
    });
  });
  
  describe('Input Validation', () => {
    test('prevents SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE bookings; --";
      
      const response = await request(app)
        .post('/api/bookings')
        .send({
          room_id: 1,
          customer_name: maliciousInput,
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T12:00:00Z'
        })
        .expect(400);
      
      // Verify table still exists
      const tableCheck = await db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings'");
      expect(tableCheck.rows).toHaveLength(1);
    });
    
    test('prevents XSS attacks', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/bookings')
        .send({
          room_id: 1,
          customer_name: xssPayload,
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T12:00:00Z'
        })
        .expect(201);
      
      // Verify payload is escaped
      expect(response.body.data.customer_name).not.toContain('<script>');
    });
  });
  
  describe('Data Protection', () => {
    test('encrypts sensitive data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      // Check password is hashed in database
      const user = await db.query('SELECT password FROM users WHERE email = $1', [userData.email]);
      expect(user.rows[0].password).not.toBe(userData.password);
      expect(user.rows[0].password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });
  });
});
```

---

## Accessibility Testing Strategy

### Automated Accessibility Testing
```javascript
// Cypress accessibility tests
describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });
  
  it('should not have accessibility violations', () => {
    cy.checkA11y();
  });
  
  it('should be keyboard navigable', () => {
    // Test tab navigation
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'email-input');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-testid', 'password-input');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-testid', 'login-button');
  });
  
  it('should have proper ARIA labels', () => {
    cy.get('[data-testid="email-input"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="password-input"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="login-button"]').should('have.attr', 'aria-label');
  });
  
  it('should announce errors to screen readers', () => {
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('have.attr', 'role', 'alert')
      .and('have.attr', 'aria-live', 'polite');
  });
});
```

### Manual Accessibility Testing
```markdown
## Accessibility Testing Checklist

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are visible and clear
- [ ] Skip links are available for main content
- [ ] Modal dialogs trap focus appropriately

### Screen Reader Compatibility
- [ ] All form inputs have descriptive labels
- [ ] Images have appropriate alt text
- [ ] Headings follow logical hierarchy (h1, h2, h3)
- [ ] Tables have proper headers and captions
- [ ] Error messages are announced to screen readers

### Visual Accessibility
- [ ] Color contrast meets WCAG 2.1 AA standards (4.5:1)
- [ ] Text is readable at 200% zoom
- [ ] Information is not conveyed by color alone
- [ ] Focus indicators are visible in high contrast mode

### Motor Accessibility
- [ ] Touch targets are at least 44x44 pixels
- [ ] Interactive elements have adequate spacing
- [ ] Drag and drop has keyboard alternatives
- [ ] Time limits can be extended or disabled
```

---

## Test Automation & CI/CD

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npm run migrate:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: npm run start &
        env:
          NODE_ENV: test
      
      - name: Wait for application
        run: npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E videos
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-videos
          path: cypress/videos

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Artillery
        run: npm install -g artillery
      
      - name: Start application
        run: npm run start &
        env:
          NODE_ENV: test
      
      - name: Wait for application
        run: npx wait-on http://localhost:3000
      
      - name: Run performance tests
        run: artillery run tests/performance/load-test.yml
      
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: artillery-report.html
```

### Test Coverage Requirements
```javascript
// Jest coverage configuration
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/utils/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
```

---

## Test Data Management

### Test Data Factory
```javascript
// Test data factory
class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user',
      ...overrides
    };
  }
  
  static createRoom(overrides = {}) {
    return {
      name: 'Test Room',
      capacity: 4,
      category: 'Standard',
      price_per_hour: 25.00,
      is_active: true,
      ...overrides
    };
  }
  
  static createBooking(overrides = {}) {
    return {
      room_id: 1,
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      start_time: '2024-01-15T10:00:00Z',
      end_time: '2024-01-15T12:00:00Z',
      status: 'confirmed',
      total_price: 50.00,
      ...overrides
    };
  }
  
  static createBusinessHours(overrides = {}) {
    return Array.from({ length: 7 }, (_, index) => ({
      day_of_week: index,
      open_time: '10:00',
      close_time: '22:00',
      is_closed: false,
      ...overrides
    }));
  }
}
```

### Database Seeding
```javascript
// Database seeding for tests
class TestDatabaseSeeder {
  static async seedUsers(count = 5) {
    const users = Array.from({ length: count }, (_, index) => 
      TestDataFactory.createUser({
        email: `user${index}@example.com`,
        name: `User ${index}`
      })
    );
    
    for (const user of users) {
      await db.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        [user.email, user.password, user.name, user.role]
      );
    }
    
    return users;
  }
  
  static async seedRooms(count = 3) {
    const rooms = Array.from({ length: count }, (_, index) => 
      TestDataFactory.createRoom({
        name: `Room ${String.fromCharCode(65 + index)}`,
        capacity: 4 + index * 2
      })
    );
    
    for (const room of rooms) {
      await db.query(
        'INSERT INTO rooms (name, capacity, category, price_per_hour) VALUES ($1, $2, $3, $4)',
        [room.name, room.capacity, room.category, room.price_per_hour]
      );
    }
    
    return rooms;
  }
  
  static async seedBookings(count = 10) {
    const bookings = Array.from({ length: count }, (_, index) => 
      TestDataFactory.createBooking({
        customer_name: `Customer ${index}`,
        start_time: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString()
      })
    );
    
    for (const booking of bookings) {
      await db.query(
        'INSERT INTO bookings (room_id, customer_name, start_time, end_time, total_price) VALUES ($1, $2, $3, $4, $5)',
        [booking.room_id, booking.customer_name, booking.start_time, booking.end_time, booking.total_price]
      );
    }
    
    return bookings;
  }
}
```

---

## Conclusion

This comprehensive testing strategy ensures the Boom Karaoke Booking System maintains high quality and reliability throughout its transformation to a SaaS platform. The strategy covers:

**Testing Coverage:**
- **Unit Tests (70%)**: Component and function testing
- **Integration Tests (25%)**: API and database testing
- **E2E Tests (5%)**: Critical user journey testing

**Quality Assurance:**
- **Performance Testing**: Load, stress, and scalability testing
- **Security Testing**: Authentication, authorization, and vulnerability testing
- **Accessibility Testing**: WCAG 2.1 AA compliance testing
- **Cross-Browser Testing**: Compatibility across major browsers

**Automation:**
- **CI/CD Integration**: Automated testing in GitHub Actions
- **Test Data Management**: Factory patterns and database seeding
- **Coverage Requirements**: 80%+ code coverage with higher standards for critical components

**Success Metrics:**
- 80%+ test coverage across all code
- < 200ms API response times under load
- 99.9% uptime and availability
- Zero critical security vulnerabilities
- WCAG 2.1 AA accessibility compliance

---

*This testing strategy provides the quality assurance foundation for the SaaS transformation. Each test type ensures reliability, performance, and security while maintaining development velocity.*

