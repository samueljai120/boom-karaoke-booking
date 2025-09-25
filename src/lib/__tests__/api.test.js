import { describe, it, expect, beforeEach } from 'vitest'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Reset any handlers that may have been modified in previous tests
    server.resetHandlers()
  })

  describe('Auth API', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toHaveProperty('user')
      expect(data).toHaveProperty('token')
      expect(data.user.email).toBe('test@example.com')
    })

    it('should handle login error', async () => {
      // Override the default handler for this test
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          )
        })
      )

      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid credentials')
    })
  })

  describe('Rooms API', () => {
    it('should fetch rooms successfully', async () => {
      const response = await fetch('/api/rooms')
      const rooms = await response.json()

      expect(response.ok).toBe(true)
      expect(Array.isArray(rooms)).toBe(true)
      expect(rooms).toHaveLength(2)
      expect(rooms[0]).toHaveProperty('id')
      expect(rooms[0]).toHaveProperty('name')
      expect(rooms[0]).toHaveProperty('capacity')
    })

    it('should create new room', async () => {
      const newRoom = {
        name: 'Test Room',
        capacity: 4,
        category: 'standard',
        price_per_hour: 40
      }

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRoom)
      })

      const room = await response.json()

      expect(response.ok).toBe(true)
      expect(room.name).toBe('New Room') // Mock returns this name
      expect(room.capacity).toBe(4)
    })

    it('should update room', async () => {
      const updatedRoom = {
        name: 'Updated Room',
        capacity: 8,
        price_per_hour: 60
      }

      const response = await fetch('/api/rooms/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedRoom)
      })

      const room = await response.json()

      expect(response.ok).toBe(true)
      expect(room.name).toBe('Updated Room')
      expect(room.capacity).toBe(8)
    })

    it('should delete room', async () => {
      const response = await fetch('/api/rooms/1', {
        method: 'DELETE'
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.message).toBe('Room deleted successfully')
    })
  })

  describe('Bookings API', () => {
    it('should fetch bookings successfully', async () => {
      const response = await fetch('/api/bookings')
      const bookings = await response.json()

      expect(response.ok).toBe(true)
      expect(Array.isArray(bookings)).toBe(true)
      expect(bookings[0]).toHaveProperty('id')
      expect(bookings[0]).toHaveProperty('customer_name')
      expect(bookings[0]).toHaveProperty('start_time')
      expect(bookings[0]).toHaveProperty('end_time')
    })

    it('should create new booking', async () => {
      const newBooking = {
        room_id: '1',
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        customer_phone: '+0987654321',
        start_time: '2024-12-21T14:00:00Z',
        end_time: '2024-12-21T16:00:00Z'
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBooking)
      })

      const booking = await response.json()

      expect(response.ok).toBe(true)
      expect(booking.customer_name).toBe('Jane Smith')
      expect(booking.room_id).toBe('1')
    })
  })

  describe('Health Check API', () => {
    it('should return health status', async () => {
      const response = await fetch('/api/health')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.status).toBe('ok')
      expect(data).toHaveProperty('timestamp')
    })
  })
})
