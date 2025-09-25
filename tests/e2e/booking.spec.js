import { test, expect } from '@playwright/test'

test.describe('Booking Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('demo@example.com')
    await page.getByLabel(/password/i).fill('demo123')
    await page.getByRole('button', { name: /login/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display booking calendar', async ({ page }) => {
    await expect(page.getByText(/booking calendar/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /new booking/i })).toBeVisible()
  })

  test('should create new booking', async ({ page }) => {
    await page.getByRole('button', { name: /new booking/i }).click()
    
    // Fill booking form
    await page.getByLabel(/customer name/i).fill('John Doe')
    await page.getByLabel(/customer email/i).fill('john@example.com')
    await page.getByLabel(/customer phone/i).fill('+1234567890')
    await page.getByLabel(/room/i).selectOption('1')
    await page.getByLabel(/start time/i).fill('2024-12-20T10:00')
    await page.getByLabel(/end time/i).fill('2024-12-20T12:00')
    
    await page.getByRole('button', { name: /create booking/i }).click()
    
    await expect(page.getByText(/booking created successfully/i)).toBeVisible()
  })

  test('should show validation errors for invalid booking data', async ({ page }) => {
    await page.getByRole('button', { name: /new booking/i }).click()
    await page.getByRole('button', { name: /create booking/i }).click()
    
    await expect(page.getByText(/customer name is required/i)).toBeVisible()
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/phone is required/i)).toBeVisible()
  })

  test('should edit existing booking', async ({ page }) => {
    // Find and click on an existing booking
    await page.locator('[data-testid="booking-item"]').first().click()
    await page.getByRole('button', { name: /edit/i }).click()
    
    // Update booking details
    await page.getByLabel(/customer name/i).clear()
    await page.getByLabel(/customer name/i).fill('Jane Smith Updated')
    
    await page.getByRole('button', { name: /save changes/i }).click()
    
    await expect(page.getByText(/booking updated successfully/i)).toBeVisible()
  })

  test('should cancel booking', async ({ page }) => {
    // Find and click on an existing booking
    await page.locator('[data-testid="booking-item"]').first().click()
    await page.getByRole('button', { name: /cancel/i }).click()
    
    // Confirm cancellation
    await page.getByRole('button', { name: /confirm/i }).click()
    
    await expect(page.getByText(/booking cancelled successfully/i)).toBeVisible()
  })

  test('should filter bookings by date', async ({ page }) => {
    const datePicker = page.getByLabel(/select date/i)
    await datePicker.fill('2024-12-20')
    
    // Verify that bookings for the selected date are displayed
    await expect(page.locator('[data-testid="booking-item"]')).toHaveCount({ min: 0 })
  })

  test('should search bookings by customer name', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search bookings/i)
    await searchInput.fill('John')
    
    // Verify search results
    await expect(page.locator('[data-testid="booking-item"]')).toContainText('John')
  })
})
