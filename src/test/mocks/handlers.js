import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      },
      token: 'mock-jwt-token'
    })
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      user: {
        id: '2',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user'
      },
      token: 'mock-jwt-token'
    })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  // Rooms endpoints
  http.get('/api/rooms', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Karaoke Room A',
        capacity: 6,
        category: 'standard',
        price_per_hour: 50,
        is_active: true
      },
      {
        id: '2',
        name: 'VIP Room B',
        capacity: 10,
        category: 'premium',
        price_per_hour: 80,
        is_active: true
      }
    ])
  }),

  http.post('/api/rooms', () => {
    return HttpResponse.json({
      id: '3',
      name: 'New Room',
      capacity: 4,
      category: 'standard',
      price_per_hour: 40,
      is_active: true
    })
  }),

  http.put('/api/rooms/:id', () => {
    return HttpResponse.json({
      id: '1',
      name: 'Updated Room',
      capacity: 8,
      category: 'standard',
      price_per_hour: 60,
      is_active: true
    })
  }),

  http.delete('/api/rooms/:id', () => {
    return HttpResponse.json({ message: 'Room deleted successfully' })
  }),

  // Bookings endpoints
  http.get('/api/bookings', () => {
    return HttpResponse.json([
      {
        id: '1',
        room_id: '1',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        start_time: '2024-12-20T10:00:00Z',
        end_time: '2024-12-20T12:00:00Z',
        status: 'confirmed',
        total_price: 100
      }
    ])
  }),

  http.post('/api/bookings', () => {
    return HttpResponse.json({
      id: '2',
      room_id: '1',
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      customer_phone: '+0987654321',
      start_time: '2024-12-21T14:00:00Z',
      end_time: '2024-12-21T16:00:00Z',
      status: 'confirmed',
      total_price: 100
    })
  }),

  http.put('/api/bookings/:id', () => {
    return HttpResponse.json({
      id: '1',
      room_id: '1',
      customer_name: 'John Doe Updated',
      customer_email: 'john@example.com',
      customer_phone: '+1234567890',
      start_time: '2024-12-20T10:00:00Z',
      end_time: '2024-12-20T12:00:00Z',
      status: 'confirmed',
      total_price: 100
    })
  }),

  http.delete('/api/bookings/:id', () => {
    return HttpResponse.json({ message: 'Booking cancelled successfully' })
  }),

  // Business hours endpoints
  http.get('/api/business-hours', () => {
    return HttpResponse.json([
      { day_of_week: 'monday', open_time: '09:00', close_time: '22:00', is_closed: false },
      { day_of_week: 'tuesday', open_time: '09:00', close_time: '22:00', is_closed: false },
      { day_of_week: 'wednesday', open_time: '09:00', close_time: '22:00', is_closed: false },
      { day_of_week: 'thursday', open_time: '09:00', close_time: '22:00', is_closed: false },
      { day_of_week: 'friday', open_time: '09:00', close_time: '23:00', is_closed: false },
      { day_of_week: 'saturday', open_time: '10:00', close_time: '23:00', is_closed: false },
      { day_of_week: 'sunday', open_time: '10:00', close_time: '21:00', is_closed: false }
    ])
  }),

  http.put('/api/business-hours', () => {
    return HttpResponse.json({ message: 'Business hours updated successfully' })
  }),

  // Settings endpoints
  http.get('/api/settings', () => {
    return HttpResponse.json({
      business_name: 'Boom Karaoke',
      timezone: 'America/New_York',
      currency: 'USD',
      booking_advance_days: 30,
      cancellation_hours: 24
    })
  }),

  http.put('/api/settings', () => {
    return HttpResponse.json({ message: 'Settings updated successfully' })
  }),

  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
]
