import express from 'express';
import { pool } from '../database/postgres.js';
import { validateTenant } from '../middleware/subdomain.js';

const router = express.Router();

// Apply tenant validation to all billing routes
// But allow both subdomain and header-based tenant resolution
router.use((req, res, next) => {
  // If no tenant from subdomain middleware, try to get from tenant context middleware
  if (!req.tenant && req.tenant_id) {
    req.tenant = { id: req.tenant_id, status: 'active' };
  }
  
  if (!req.tenant) {
    return res.status(400).json({
      error: 'No tenant context',
      message: 'This endpoint requires a valid tenant subdomain or tenant ID header'
    });
  }
  
  if (req.tenant.status !== 'active') {
    return res.status(403).json({
      error: 'Tenant inactive',
      message: 'This tenant account is not active',
      status: req.tenant.status
    });
  }
  
  next();
});

// Get tenant billing information
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenant_id;
    const { period = 'current' } = req.query;

    // Get tenant information
    const tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = tenantResult.rows[0];

    // Get usage for current period
    const usage = await getUsageForPeriod(tenantId, period);
    
    // Calculate billing
    const billing = calculateBilling(tenant.plan_type, usage);
    
    // Get payment history
    const paymentHistory = await getPaymentHistory(tenantId);

    res.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          plan_type: tenant.plan_type,
          status: tenant.status
        },
        usage,
        billing,
        payment_history: paymentHistory
      }
    });
  } catch (error) {
    console.error('Error fetching billing info:', error);
    res.status(500).json({ error: 'Failed to fetch billing information' });
  }
});

// Get usage for a specific period
async function getUsageForPeriod(tenantId, period) {
  const dateRange = getPeriodDateRange(period);

  // Get bookings usage
  const bookingsQuery = `
    SELECT COUNT(*) as booking_count
    FROM bookings 
    WHERE tenant_id = $1 
      AND created_at >= $2 
      AND created_at <= $3
  `;

  const bookingsResult = await pool.query(bookingsQuery, [tenantId, dateRange.start, dateRange.end]);

  // Get rooms usage
  const roomsQuery = `
    SELECT COUNT(*) as room_count
    FROM rooms 
    WHERE tenant_id = $1 
      AND is_active = true
  `;

  const roomsResult = await pool.query(roomsQuery, [tenantId]);

  // Get API usage
  const apiUsageQuery = `
    SELECT COUNT(*) as api_calls
    FROM audit_logs 
    WHERE tenant_id = $1 
      AND resource_type = 'api_usage'
      AND created_at >= $2 
      AND created_at <= $3
  `;

  const apiUsageResult = await pool.query(apiUsageQuery, [tenantId, dateRange.start, dateRange.end]);

  // Get storage usage (estimated based on data size)
  const storageQuery = `
    SELECT 
      (SELECT pg_size_pretty(pg_total_relation_size('bookings'))) as bookings_size,
      (SELECT pg_size_pretty(pg_total_relation_size('rooms'))) as rooms_size
  `;

  const storageResult = await pool.query(storageQuery);

  return {
    period: period,
    date_range: dateRange,
    bookings: {
      count: parseInt(bookingsResult.rows[0].booking_count),
      limit: getPlanLimits(tenantId).bookings
    },
    rooms: {
      count: parseInt(roomsResult.rows[0].room_count),
      limit: getPlanLimits(tenantId).rooms
    },
    api_calls: {
      count: parseInt(apiUsageResult.rows[0].api_calls),
      limit: getPlanLimits(tenantId).api_calls
    },
    storage: {
      bookings_size: storageResult.rows[0].bookings_size,
      rooms_size: storageResult.rows[0].rooms_size
    }
  };
}

// Calculate billing based on plan and usage
function calculateBilling(planType, usage) {
  const planLimits = getPlanLimitsByType(planType);
  const overages = calculateOverages(usage, planLimits);
  
  const basePrice = planLimits.price;
  const overageCharges = calculateOverageCharges(overages);
  const totalAmount = basePrice + overageCharges.total;

  return {
    plan: {
      type: planType,
      base_price: basePrice,
      limits: planLimits
    },
    overages,
    overage_charges: overageCharges,
    total_amount: totalAmount,
    currency: 'USD',
    billing_period: 'monthly'
  };
}

// Get plan limits by plan type
function getPlanLimitsByType(planType) {
  const plans = {
    'free': {
      price: 0,
      bookings: 50,
      rooms: 1,
      api_calls: 1000,
      storage_gb: 1
    },
    'basic': {
      price: 19,
      bookings: 500,
      rooms: 5,
      api_calls: 10000,
      storage_gb: 5
    },
    'pro': {
      price: 49,
      bookings: 2000,
      rooms: 20,
      api_calls: 50000,
      storage_gb: 20
    },
    'business': {
      price: 99,
      bookings: 10000,
      rooms: 100,
      api_calls: 200000,
      storage_gb: 100
    },
    'professional': {
      price: 99,
      bookings: 10000,
      rooms: 100,
      api_calls: 200000,
      storage_gb: 100
    }
  };

  return plans[planType] || plans['free'];
}

// Get plan limits for tenant (you might want to fetch from database)
async function getPlanLimits(tenantId) {
  const tenantResult = await pool.query(
    'SELECT plan_type FROM tenants WHERE id = $1',
    [tenantId]
  );
  
  const planType = tenantResult.rows[0]?.plan_type || 'free';
  return getPlanLimitsByType(planType);
}

// Calculate overages
function calculateOverages(usage, limits) {
  return {
    bookings: Math.max(0, usage.bookings.count - limits.bookings),
    rooms: Math.max(0, usage.rooms.count - limits.rooms),
    api_calls: Math.max(0, usage.api_calls.count - limits.api_calls)
  };
}

// Calculate overage charges
function calculateOverageCharges(overages) {
  const rates = {
    bookings: 0.10, // $0.10 per extra booking
    rooms: 5.00,    // $5.00 per extra room
    api_calls: 0.001 // $0.001 per extra API call
  };

  return {
    bookings: overages.bookings * rates.bookings,
    rooms: overages.rooms * rates.rooms,
    api_calls: overages.api_calls * rates.api_calls,
    total: (overages.bookings * rates.bookings) + 
           (overages.rooms * rates.rooms) + 
           (overages.api_calls * rates.api_calls)
  };
}

// Get payment history
async function getPaymentHistory(tenantId) {
  const query = `
    SELECT 
      id,
      amount,
      currency,
      status,
      description,
      created_at,
      paid_at
    FROM payments 
    WHERE tenant_id = $1 
    ORDER BY created_at DESC 
    LIMIT 10
  `;

  try {
    const result = await pool.query(query, [tenantId]);
    return result.rows;
  } catch (error) {
    // If payments table doesn't exist, return empty array
    console.log('Payments table not found, returning empty history');
    return [];
  }
}

// Get period date range
function getPeriodDateRange(period) {
  const now = new Date();
  let start;

  switch (period) {
    case 'current':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'previous':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      now.setMonth(now.getMonth() - 1);
      now.setMonth(now.getMonth() + 1, 0);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return {
    start,
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  };
}

// Update tenant plan
router.put('/plan', async (req, res) => {
  try {
    const { plan_type } = req.body;
    const tenantId = req.tenant_id;

    // Validate plan type
    const validPlans = ['free', 'basic', 'pro', 'business', 'professional'];
    if (!validPlans.includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    // Update tenant plan
    const result = await pool.query(
      'UPDATE tenants SET plan_type = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [plan_type, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Plan updated to ${plan_type}`
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Get usage alerts
router.get('/alerts', async (req, res) => {
  try {
    const tenantId = req.tenant_id;
    const usage = await getUsageForPeriod(tenantId, 'current');
    const limits = await getPlanLimits(tenantId);
    
    const alerts = [];

    // Check for usage approaching limits (80% threshold)
    const thresholds = {
      bookings: 0.8,
      rooms: 0.8,
      api_calls: 0.8
    };

    if (usage.bookings.count >= limits.bookings * thresholds.bookings) {
      alerts.push({
        type: 'warning',
        metric: 'bookings',
        message: `You've used ${Math.round((usage.bookings.count / limits.bookings) * 100)}% of your booking limit`,
        current: usage.bookings.count,
        limit: limits.bookings
      });
    }

    if (usage.rooms.count >= limits.rooms * thresholds.rooms) {
      alerts.push({
        type: 'warning',
        metric: 'rooms',
        message: `You've used ${Math.round((usage.rooms.count / limits.rooms) * 100)}% of your room limit`,
        current: usage.rooms.count,
        limit: limits.rooms
      });
    }

    if (usage.api_calls.count >= limits.api_calls * thresholds.api_calls) {
      alerts.push({
        type: 'warning',
        metric: 'api_calls',
        message: `You've used ${Math.round((usage.api_calls.count / limits.api_calls) * 100)}% of your API call limit`,
        current: usage.api_calls.count,
        limit: limits.api_calls
      });
    }

    // Check for overages
    const overages = calculateOverages(usage, limits);
    
    if (overages.bookings > 0) {
      alerts.push({
        type: 'error',
        metric: 'bookings',
        message: `You've exceeded your booking limit by ${overages.bookings}`,
        overage: overages.bookings
      });
    }

    if (overages.rooms > 0) {
      alerts.push({
        type: 'error',
        metric: 'rooms',
        message: `You've exceeded your room limit by ${overages.rooms}`,
        overage: overages.rooms
      });
    }

    if (overages.api_calls > 0) {
      alerts.push({
        type: 'error',
        metric: 'api_calls',
        message: `You've exceeded your API call limit by ${overages.api_calls}`,
        overage: overages.api_calls
      });
    }

    res.json({
      success: true,
      data: {
        alerts,
        usage_summary: {
          bookings: `${usage.bookings.count}/${limits.bookings}`,
          rooms: `${usage.rooms.count}/${limits.rooms}`,
          api_calls: `${usage.api_calls.count}/${limits.api_calls}`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;
