import express from 'express';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'boom_booking',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password'
});

// Email transporter configuration
const createTransporter = () => {
  // Use different email services based on environment
  if (process.env.SMTP_HOST) {
    // Custom SMTP configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else if (process.env.GMAIL_USER) {
    // Gmail configuration
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  } else {
    // Development mode - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Email templates
const emailTemplates = {
  bookingConfirmation: (booking) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎤 Booking Confirmed!</h1>
          <p>Your karaoke room reservation is confirmed</p>
        </div>
        <div class="content">
          <h2>Booking Details</h2>
          <div class="booking-details">
            <p><strong>Room:</strong> ${booking.room_name}</p>
            <p><strong>Date:</strong> ${new Date(booking.start_time).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}</p>
            <p><strong>Duration:</strong> ${Math.round((new Date(booking.end_time) - new Date(booking.start_time)) / (1000 * 60 * 60) * 10) / 10} hours</p>
            <p><strong>Customer:</strong> ${booking.customer_name}</p>
            <p><strong>Contact:</strong> ${booking.customer_email}</p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
          </div>
          <p>Thank you for choosing us! We look forward to seeing you.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5001'}/dashboard" class="button">View Booking</a>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© 2024 Boom Booking. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bookingReminder: (booking) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #f093fb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Booking Reminder</h1>
          <p>Your karaoke session is coming up soon!</p>
        </div>
        <div class="content">
          <h2>Upcoming Booking</h2>
          <div class="booking-details">
            <p><strong>Room:</strong> ${booking.room_name}</p>
            <p><strong>Date:</strong> ${new Date(booking.start_time).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}</p>
            <p><strong>Duration:</strong> ${Math.round((new Date(booking.end_time) - new Date(booking.start_time)) / (1000 * 60 * 60) * 10) / 10} hours</p>
            <p><strong>Customer:</strong> ${booking.customer_name}</p>
          </div>
          <p>We're excited to see you! Please arrive 10 minutes early to check in.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5001'}/dashboard" class="button">Manage Booking</a>
        </div>
        <div class="footer">
          <p>This is an automated reminder. Please do not reply to this email.</p>
          <p>© 2024 Boom Booking. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bookingCancellation: (booking) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; background: #fcb69f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Booking Cancelled</h1>
          <p>Your karaoke room reservation has been cancelled</p>
        </div>
        <div class="content">
          <h2>Cancelled Booking Details</h2>
          <div class="booking-details">
            <p><strong>Room:</strong> ${booking.room_name}</p>
            <p><strong>Date:</strong> ${new Date(booking.start_time).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}</p>
            <p><strong>Customer:</strong> ${booking.customer_name}</p>
          </div>
          <p>We're sorry to see you cancel. We hope to see you again soon!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5001'}" class="button">Book Again</a>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© 2024 Boom Booking. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcomeEmail: (user) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .feature { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Boom Booking!</h1>
          <p>Your venue management journey starts now</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name || 'there'}!</h2>
          <p>Welcome to Boom Booking - the smartest way to manage your karaoke venue bookings!</p>
          
          <h3>What you can do:</h3>
          <div class="feature">
            <strong>📅 Smart Booking System</strong><br>
            Manage room availability with real-time updates
          </div>
          <div class="feature">
            <strong>📊 Analytics Dashboard</strong><br>
            Track your revenue and booking patterns
          </div>
          <div class="feature">
            <strong>📱 Mobile Ready</strong><br>
            Manage bookings from anywhere, anytime
          </div>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5001'}/dashboard" class="button">Get Started</a>
        </div>
        <div class="footer">
          <p>Need help? Contact us at support@boombooking.com</p>
          <p>© 2024 Boom Booking. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Send email function
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@boombooking.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Routes

// Send booking confirmation email
router.post('/booking-confirmation', async (req, res) => {
  try {
    const { bookingId, customerEmail } = req.body;
    
    if (!bookingId || !customerEmail) {
      return res.status(400).json({ error: 'Booking ID and customer email are required' });
    }

    // Get booking details from database
    const client = await pool.connect();
    const bookingResult = await client.query(`
      SELECT b.*, r.name as room_name 
      FROM bookings b 
      JOIN rooms r ON b.room_id = r.id 
      WHERE b.id = $1
    `, [bookingId]);
    client.release();

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const html = emailTemplates.bookingConfirmation(booking);
    
    const result = await sendEmail(
      customerEmail,
      `Booking Confirmed - ${booking.room_name} on ${new Date(booking.start_time).toLocaleDateString()}`,
      html
    );

    if (result.success) {
      res.json({ success: true, message: 'Confirmation email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: result.error });
    }
  } catch (error) {
    console.error('Booking confirmation email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send booking reminder email
router.post('/booking-reminder', async (req, res) => {
  try {
    const { bookingId, customerEmail } = req.body;
    
    if (!bookingId || !customerEmail) {
      return res.status(400).json({ error: 'Booking ID and customer email are required' });
    }

    // Get booking details from database
    const client = await pool.connect();
    const bookingResult = await client.query(`
      SELECT b.*, r.name as room_name 
      FROM bookings b 
      JOIN rooms r ON b.room_id = r.id 
      WHERE b.id = $1
    `, [bookingId]);
    client.release();

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const html = emailTemplates.bookingReminder(booking);
    
    const result = await sendEmail(
      customerEmail,
      `Reminder: Your karaoke booking is tomorrow - ${booking.room_name}`,
      html
    );

    if (result.success) {
      res.json({ success: true, message: 'Reminder email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: result.error });
    }
  } catch (error) {
    console.error('Booking reminder email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send booking cancellation email
router.post('/booking-cancellation', async (req, res) => {
  try {
    const { bookingId, customerEmail } = req.body;
    
    if (!bookingId || !customerEmail) {
      return res.status(400).json({ error: 'Booking ID and customer email are required' });
    }

    // Get booking details from database
    const client = await pool.connect();
    const bookingResult = await client.query(`
      SELECT b.*, r.name as room_name 
      FROM bookings b 
      JOIN rooms r ON b.room_id = r.id 
      WHERE b.id = $1
    `, [bookingId]);
    client.release();

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    const html = emailTemplates.bookingCancellation(booking);
    
    const result = await sendEmail(
      customerEmail,
      `Booking Cancelled - ${booking.room_name}`,
      html
    );

    if (result.success) {
      res.json({ success: true, message: 'Cancellation email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: result.error });
    }
  } catch (error) {
    console.error('Booking cancellation email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send welcome email
router.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const html = emailTemplates.welcomeEmail({ name });
    
    const result = await sendEmail(
      email,
      'Welcome to Boom Booking - Your Venue Management Solution',
      html
    );

    if (result.success) {
      res.json({ success: true, message: 'Welcome email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: result.error });
    }
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send test email
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const html = `
      <h1>Test Email from Boom Booking</h1>
      <p>This is a test email to verify your email configuration.</p>
      <p>If you received this email, your email system is working correctly!</p>
      <p>Sent at: ${new Date().toISOString()}</p>
    `;
    
    const result = await sendEmail(
      email,
      'Boom Booking - Test Email',
      html
    );

    if (result.success) {
      res.json({ success: true, message: 'Test email sent successfully', messageId: result.messageId });
    } else {
      res.status(500).json({ error: 'Failed to send email', details: result.error });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get email configuration status
router.get('/config', (req, res) => {
  const config = {
    smtpConfigured: !!(process.env.SMTP_HOST || process.env.GMAIL_USER),
    fromEmail: process.env.FROM_EMAIL || 'noreply@boombooking.com',
    service: process.env.SMTP_HOST ? 'Custom SMTP' : process.env.GMAIL_USER ? 'Gmail' : 'Ethereal (Development)'
  };
  
  res.json(config);
});

export default router;
