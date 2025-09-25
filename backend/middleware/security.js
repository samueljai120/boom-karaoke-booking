import rateLimit from 'express-rate-limit'
import compression from 'compression'
import xss from 'xss'
import { body, validationResult } from 'express-validator'

// Rate limiting configurations
export const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message || 'Too many requests, please try again later',
        retryAfter: Math.round(windowMs / 1000)
      })
    }
  })
}

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again later'
)

export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many API requests, please slow down'
)

export const strictRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // 20 requests per window
  'Rate limit exceeded, please try again later'
)

// Compression middleware
export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if the response has a no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false
    }
    return compression.filter(req, res)
  }
})

// XSS protection middleware
export const xssProtection = (req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query)
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params)
  }

  next()
}

// Recursively sanitize objects
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'string') {
    return xss(obj, {
      whiteList: {
        // Allow certain HTML tags for rich text
        p: [],
        br: [],
        strong: [],
        em: [],
        ul: [],
        ol: [],
        li: [],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    })
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }

  if (typeof obj === 'object') {
    const sanitized = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }

  return obj
}

// Input validation middleware
export const validateInput = (validations) => {
  return async (req, res, next) => {
    // Run validations
    await Promise.all(validations.map(validation => validation.run(req)))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: err.value
        }))
      })
    }

    next()
  }
}

// Common validation rules
export const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  phone: body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  name: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  uuid: body('id')
    .optional()
    .isUUID()
    .withMessage('Invalid ID format'),

  date: body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  time: body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),

  positiveNumber: (field) => body(field)
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a positive number`),

  roomCapacity: body('capacity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Room capacity must be between 1 and 50'),

  price: body('price_per_hour')
    .isNumeric()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Price must be between 0 and 1000')
}

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By')

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none'"
  )

  next()
}

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }

    // Log slow requests
    if (duration > 1000) {
      console.warn('Slow request detected:', logData)
    }

    // Log errors
    if (res.statusCode >= 400) {
      console.error('Request error:', logData)
    }

    // Log successful requests in development
    if (process.env.NODE_ENV === 'development' && res.statusCode < 400) {
      console.log('Request:', logData)
    }
  })

  next()
}

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress
    
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied from this IP address'
      })
    }
    
    next()
  }
}

// Request size limit middleware
export const requestSizeLimit = (maxSize) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0')
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request payload too large',
        maxSize: `${maxSize / 1024}KB`
      })
    }
    
    next()
  }
}

// Database query timeout middleware
export const queryTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to process'
        })
      }
    }, timeoutMs)

    res.on('finish', () => {
      clearTimeout(timeout)
    })

    next()
  }
}
