import express from 'express';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email configuration (using Ethereal for development)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  });
};

// Get email configuration status
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: true,
      provider: 'Ethereal Email (Development)',
      from: 'noreply@boombooking.com',
      status: 'ready'
    }
  });
});

// Send booking confirmation email
router.post('/booking-confirmation', [
  body('to').isEmail().withMessage('Valid email is required'),
  body('bookingData').isObject().withMessage('Booking data is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { to, bookingData } = req.body;

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'noreply@boombooking.com',
      to: to,
      subject: 'Booking Confirmation - Boom Karaoke',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎤 Boom Karaoke</h1>
            <p style="color: white; margin: 10px 0 0 0;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Your booking has been confirmed!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Booking Details</h3>
              <p><strong>Room:</strong> ${bookingData.roomName || 'Room A'}</p>
              <p><strong>Date:</strong> ${bookingData.date || 'Today'}</p>
              <p><strong>Time:</strong> ${bookingData.time || '2:00 PM - 4:00 PM'}</p>
              <p><strong>Duration:</strong> ${bookingData.duration || '2 hours'}</p>
              <p><strong>Total:</strong> $${bookingData.total || '50.00'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Booking Details
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Thank you for choosing Boom Karaoke! We look forward to seeing you soon.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Booking confirmation email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Send test email
router.post('/test', [
  body('to').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { to } = req.body;

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'noreply@boombooking.com',
      to: to,
      subject: 'Test Email - Boom Karaoke',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎤 Boom Karaoke</h1>
            <p style="color: white; margin: 10px 0 0 0;">Test Email</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Email system is working!</h2>
            <p>This is a test email to verify that the email notification system is functioning correctly.</p>
            <p style="color: #666; font-size: 14px;">
              If you received this email, the Boom Karaoke email system is properly configured.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

export default router;
