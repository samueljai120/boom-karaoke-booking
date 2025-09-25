// Vercel API Route: /api/auth/login
import { sql, initDatabase, setTenantContext } from '../lib/neon-db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  resolveTenant, 
  validateTenant, 
  setCorsHeaders, 
  handlePreflight 
} from '../lib/tenant-middleware.js';

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (handlePreflight(req, res)) return;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Initialize database if needed
    await initDatabase();
    
    // Resolve tenant context
    await resolveTenant(req, res, () => {});
    
    // Validate tenant
    validateTenant(req, res, () => {});
    
    if (res.headersSent) return; // If tenant validation failed
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Set tenant context for RLS
    await setTenantContext(req.tenant_id);

    // Find user in database with tenant context
    const result = await sql`
      SELECT u.id, u.email, u.password, u.name, tu.role, tu.permissions
      FROM users u
      JOIN tenant_users tu ON u.id = tu.user_id
      WHERE u.email = ${email} AND tu.tenant_id = ${req.tenant_id}
    `;

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = result[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token with tenant context
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        tenant_id: req.tenant_id,
        tenant_name: req.tenant.name,
        tenant_subdomain: req.tenant.subdomain
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      },
      tenant: {
        id: req.tenant.id,
        name: req.tenant.name,
        subdomain: req.tenant.subdomain,
        plan_type: req.tenant.plan_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback to demo login for development
    const { email, password } = req.body;
    
    if (email === 'demo@example.com' && password === 'demo123') {
      res.status(200).json({
        success: true,
        token: 'demo-token-123',
        user: {
          id: 'demo-user-1',
          email: 'demo@example.com',
          name: 'Demo Admin',
          role: 'admin',
          permissions: { all: true }
        },
        tenant: {
          id: 'demo-tenant-id',
          name: 'Demo Karaoke',
          subdomain: 'demo',
          plan_type: 'professional'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  }
}
