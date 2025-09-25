import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../database/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Create forms table if it doesn't exist
const createFormsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        form_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        data JSONB NOT NULL,
        files JSONB DEFAULT '[]',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        admin_notes TEXT,
        assigned_to UUID,
        priority VARCHAR(20) DEFAULT 'medium'
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(form_type);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);
    `);
  } catch (error) {
    console.error('Error creating forms table:', error);
  }
};

// Initialize table
createFormsTable();

// Contact Form Submission
router.post('/contact', [
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('company').optional().isLength({ max: 100 }).trim(),
  body('phone').optional().isLength({ max: 20 }).trim(),
  body('subject').isLength({ min: 5, max: 200 }).trim(),
  body('message').isLength({ min: 10, max: 2000 }).trim(),
  body('inquiry_type').optional().isIn(['general', 'sales', 'support', 'partnership', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, company, phone, subject, message, inquiry_type = 'general' } = req.body;
    
    const formData = {
      name,
      email,
      company,
      phone,
      subject,
      message,
      inquiry_type
    };

    const result = await pool.query(`
      INSERT INTO form_submissions (form_type, data, ip_address, user_agent, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [
      'contact',
      JSON.stringify(formData),
      req.ip,
      req.get('User-Agent'),
      inquiry_type === 'sales' ? 'high' : 'medium'
    ]);

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      submission_id: result.rows[0].id,
      timestamp: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
});

// Career Application Form Submission
router.post('/career', upload.single('resume'), [
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isLength({ min: 10, max: 20 }).trim(),
  body('position').isLength({ min: 2, max: 100 }).trim(),
  body('experience_years').isInt({ min: 0, max: 50 }),
  body('cover_letter').isLength({ min: 50, max: 2000 }).trim(),
  body('availability').isLength({ min: 5, max: 100 }).trim(),
  body('salary_expectation').optional().isLength({ max: 50 }).trim(),
  body('linkedin_url').optional().isURL(),
  body('portfolio_url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      phone, 
      position, 
      experience_years, 
      cover_letter, 
      availability, 
      salary_expectation,
      linkedin_url,
      portfolio_url
    } = req.body;

    const formData = {
      name,
      email,
      phone,
      position,
      experience_years: parseInt(experience_years),
      cover_letter,
      availability,
      salary_expectation,
      linkedin_url,
      portfolio_url
    };

    const files = [];
    if (req.file) {
      files.push({
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });
    }

    const result = await pool.query(`
      INSERT INTO form_submissions (form_type, data, files, ip_address, user_agent, priority)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
    `, [
      'career',
      JSON.stringify(formData),
      JSON.stringify(files),
      req.ip,
      req.get('User-Agent'),
      'high'
    ]);

    res.status(201).json({
      success: true,
      message: 'Career application submitted successfully',
      submission_id: result.rows[0].id,
      timestamp: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Career application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit career application',
      error: error.message
    });
  }
});

// API Request Form Submission
router.post('/api-request', [
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('company').isLength({ min: 2, max: 100 }).trim(),
  body('website').optional().isURL(),
  body('use_case').isLength({ min: 10, max: 1000 }).trim(),
  body('expected_volume').isIn(['low', 'medium', 'high', 'enterprise']),
  body('integration_type').isIn(['webhook', 'rest_api', 'sdk', 'other']),
  body('timeline').isIn(['immediate', '1_month', '3_months', '6_months', 'flexible']),
  body('additional_requirements').optional().isLength({ max: 1000 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      company, 
      website, 
      use_case, 
      expected_volume, 
      integration_type, 
      timeline,
      additional_requirements
    } = req.body;

    const formData = {
      name,
      email,
      company,
      website,
      use_case,
      expected_volume,
      integration_type,
      timeline,
      additional_requirements
    };

    const result = await pool.query(`
      INSERT INTO form_submissions (form_type, data, ip_address, user_agent, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [
      'api_request',
      JSON.stringify(formData),
      req.ip,
      req.get('User-Agent'),
      'high'
    ]);

    res.status(201).json({
      success: true,
      message: 'API request submitted successfully',
      submission_id: result.rows[0].id,
      timestamp: result.rows[0].created_at
    });
  } catch (error) {
    console.error('API request submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit API request',
      error: error.message
    });
  }
});

// Privacy Inquiry Form Submission
router.post('/privacy', [
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('inquiry_type').isIn(['data_access', 'data_deletion', 'data_correction', 'consent_withdrawal', 'complaint', 'other']),
  body('subject').isLength({ min: 5, max: 200 }).trim(),
  body('description').isLength({ min: 10, max: 2000 }).trim(),
  body('data_subject_id').optional().isLength({ max: 100 }).trim(),
  body('urgency').isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      inquiry_type, 
      subject, 
      description, 
      data_subject_id,
      urgency
    } = req.body;

    const formData = {
      name,
      email,
      inquiry_type,
      subject,
      description,
      data_subject_id,
      urgency
    };

    const result = await pool.query(`
      INSERT INTO form_submissions (form_type, data, ip_address, user_agent, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [
      'privacy',
      JSON.stringify(formData),
      req.ip,
      req.get('User-Agent'),
      urgency === 'urgent' ? 'high' : urgency === 'high' ? 'high' : 'medium'
    ]);

    res.status(201).json({
      success: true,
      message: 'Privacy inquiry submitted successfully',
      submission_id: result.rows[0].id,
      timestamp: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Privacy inquiry submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit privacy inquiry',
      error: error.message
    });
  }
});

// Help Center Support Form Submission
router.post('/support', [
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('category').isIn(['technical', 'billing', 'account', 'feature_request', 'bug_report', 'other']),
  body('subject').isLength({ min: 5, max: 200 }).trim(),
  body('description').isLength({ min: 10, max: 2000 }).trim(),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']),
  body('tenant_subdomain').optional().isLength({ max: 100 }).trim(),
  body('attachments').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      category, 
      subject, 
      description, 
      priority,
      tenant_subdomain,
      attachments = []
    } = req.body;

    const formData = {
      name,
      email,
      category,
      subject,
      description,
      priority,
      tenant_subdomain,
      attachments
    };

    const result = await pool.query(`
      INSERT INTO form_submissions (form_type, data, ip_address, user_agent, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [
      'support',
      JSON.stringify(formData),
      req.ip,
      req.get('User-Agent'),
      priority === 'urgent' ? 'high' : priority === 'high' ? 'high' : 'medium'
    ]);

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully',
      submission_id: result.rows[0].id,
      timestamp: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Support request submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit support request',
      error: error.message
    });
  }
});

// Get all form submissions (Admin only)
router.get('/admin/submissions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      form_type, 
      status, 
      priority,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    if (form_type) {
      paramCount++;
      whereClause += ` AND form_type = $${paramCount}`;
      queryParams.push(form_type);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }

    if (priority) {
      paramCount++;
      whereClause += ` AND priority = $${paramCount}`;
      queryParams.push(priority);
    }

    const validSortColumns = ['created_at', 'updated_at', 'form_type', 'status', 'priority'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) as total FROM form_submissions ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    const dataQuery = `
      SELECT 
        id,
        form_type,
        status,
        data,
        files,
        ip_address,
        user_agent,
        created_at,
        updated_at,
        admin_notes,
        assigned_to,
        priority
      FROM form_submissions 
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const dataResult = await pool.query(dataQuery, queryParams);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form submissions',
      error: error.message
    });
  }
});

// Update form submission status (Admin only)
router.patch('/admin/submissions/:id', [
  body('status').optional().isIn(['pending', 'in_progress', 'resolved', 'closed']),
  body('admin_notes').optional().isLength({ max: 1000 }).trim(),
  body('assigned_to').optional().isUUID(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, admin_notes, assigned_to, priority } = req.body;

    const updateFields = [];
    const queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      queryParams.push(status);
    }

    if (admin_notes !== undefined) {
      paramCount++;
      updateFields.push(`admin_notes = $${paramCount}`);
      queryParams.push(admin_notes);
    }

    if (assigned_to !== undefined) {
      paramCount++;
      updateFields.push(`assigned_to = $${paramCount}`);
      queryParams.push(assigned_to);
    }

    if (priority) {
      paramCount++;
      updateFields.push(`priority = $${paramCount}`);
      queryParams.push(priority);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(id);

    const updateQuery = `
      UPDATE form_submissions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Form submission updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update form submission',
      error: error.message
    });
  }
});

// Get form submission statistics (Admin only)
router.get('/admin/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        form_type,
        status,
        priority,
        COUNT(*) as count,
        DATE_TRUNC('day', created_at) as date
      FROM form_submissions 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY form_type, status, priority, DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `;

    const result = await pool.query(statsQuery);

    // Process the results into a more useful format
    const stats = {
      total_submissions: 0,
      by_type: {},
      by_status: {},
      by_priority: {},
      daily_submissions: {}
    };

    result.rows.forEach(row => {
      stats.total_submissions += parseInt(row.count);
      
      // By type
      if (!stats.by_type[row.form_type]) {
        stats.by_type[row.form_type] = 0;
      }
      stats.by_type[row.form_type] += parseInt(row.count);

      // By status
      if (!stats.by_status[row.status]) {
        stats.by_status[row.status] = 0;
      }
      stats.by_status[row.status] += parseInt(row.count);

      // By priority
      if (!stats.by_priority[row.priority]) {
        stats.by_priority[row.priority] = 0;
      }
      stats.by_priority[row.priority] += parseInt(row.count);

      // Daily submissions
      const date = row.date.toISOString().split('T')[0];
      if (!stats.daily_submissions[date]) {
        stats.daily_submissions[date] = 0;
      }
      stats.daily_submissions[date] += parseInt(row.count);
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching form statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form statistics',
      error: error.message
    });
  }
});

export default router;
