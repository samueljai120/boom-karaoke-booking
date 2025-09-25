import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    rooms: 1,
    bookingsPerMonth: 50,
    features: ['Basic booking', 'Email notifications']
  },
  basic: {
    name: 'Basic',
    price: 19,
    rooms: 5,
    bookingsPerMonth: 500,
    features: ['Basic booking', 'Email notifications', 'Calendar integration']
  },
  pro: {
    name: 'Pro',
    price: 49,
    rooms: 20,
    bookingsPerMonth: 2000,
    features: ['All Basic features', 'API access', 'Custom branding', 'Advanced analytics']
  },
  business: {
    name: 'Business',
    price: 99,
    rooms: -1, // unlimited
    bookingsPerMonth: -1, // unlimited
    features: ['All Pro features', 'White-label', 'Priority support', 'Multi-location']
  }
};

// Mock tenant data - in production, this would come from database
const mockTenants = {
  'demo-tenant': {
    id: 'demo-tenant',
    name: 'Demo Karaoke',
    plan: 'free',
    subscriptionStatus: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usage: {
      rooms: 3, // They have 3 rooms but free plan allows only 1
      bookingsThisMonth: 15,
      roomsUsed: 3,
      roomsLimit: 1
    }
  }
};

// Get subscription status for tenant
router.get('/status/:tenantId', (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = mockTenants[tenantId];
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const planConfig = SUBSCRIPTION_PLANS[tenant.plan];
    const usage = tenant.usage;
    
    // Check if tenant is over limits
    const isOverRoomLimit = planConfig.rooms !== -1 && usage.roomsUsed > planConfig.rooms;
    const isOverBookingLimit = planConfig.bookingsPerMonth !== -1 && usage.bookingsThisMonth > planConfig.bookingsPerMonth;
    const isOverLimit = isOverRoomLimit || isOverBookingLimit;

    res.json({
      success: true,
      data: {
        tenantId: tenant.id,
        plan: tenant.plan,
        planName: planConfig.name,
        status: tenant.subscriptionStatus,
        currentPeriodEnd: tenant.currentPeriodEnd,
        usage: {
          rooms: {
            used: usage.roomsUsed,
            limit: planConfig.rooms,
            unlimited: planConfig.rooms === -1
          },
          bookings: {
            used: usage.bookingsThisMonth,
            limit: planConfig.bookingsPerMonth,
            unlimited: planConfig.bookingsPerMonth === -1
          }
        },
        limits: {
          isOverLimit,
          isOverRoomLimit,
          isOverBookingLimit,
          overLimitMessage: isOverLimit ? 
            (isOverRoomLimit ? 'Room limit exceeded' : 'Monthly booking limit exceeded') : null
        },
        planConfig
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription status'
    });
  }
});

// Check if action is allowed based on subscription limits
router.post('/check-limit', (req, res) => {
  try {
    const { tenantId, action, data } = req.body;
    const tenant = mockTenants[tenantId];
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const planConfig = SUBSCRIPTION_PLANS[tenant.plan];
    const usage = tenant.usage;
    let isAllowed = true;
    let reason = null;
    let upgradeRequired = false;

    switch (action) {
      case 'create_room':
        if (planConfig.rooms !== -1 && usage.roomsUsed >= planConfig.rooms) {
          isAllowed = false;
          reason = `Room limit reached. You can only have ${planConfig.rooms} room(s) on the ${planConfig.name} plan.`;
          upgradeRequired = true;
        }
        break;
        
      case 'create_booking':
        if (planConfig.bookingsPerMonth !== -1 && usage.bookingsThisMonth >= planConfig.bookingsPerMonth) {
          isAllowed = false;
          reason = `Monthly booking limit reached. You can only have ${planConfig.bookingsPerMonth} bookings per month on the ${planConfig.name} plan.`;
          upgradeRequired = true;
        }
        break;
        
      default:
        isAllowed = true;
    }

    res.json({
      success: true,
      data: {
        isAllowed,
        reason,
        upgradeRequired,
        currentPlan: tenant.plan,
        currentUsage: usage,
        limits: {
          rooms: planConfig.rooms,
          bookingsPerMonth: planConfig.bookingsPerMonth
        }
      }
    });
  } catch (error) {
    console.error('Error checking limit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check limit'
    });
  }
});

// Get upgrade options
router.get('/upgrade-options/:tenantId', (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = mockTenants[tenantId];
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const currentPlan = tenant.plan;
    const currentPlanConfig = SUBSCRIPTION_PLANS[currentPlan];
    
    // Get all plans that are upgrades from current plan
    const planOrder = ['free', 'basic', 'pro', 'business'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const upgradeOptions = planOrder.slice(currentIndex + 1).map(planKey => {
      const plan = SUBSCRIPTION_PLANS[planKey];
      return {
        key: planKey,
        name: plan.name,
        price: plan.price,
        features: plan.features,
        benefits: {
          rooms: plan.rooms === -1 ? 'Unlimited' : `${plan.rooms} rooms`,
          bookings: plan.bookingsPerMonth === -1 ? 'Unlimited' : `${plan.bookingsPerMonth} bookings/month`,
          additionalFeatures: plan.features.filter(f => !currentPlanConfig.features.includes(f))
        }
      };
    });

    res.json({
      success: true,
      data: {
        currentPlan: {
          key: currentPlan,
          name: currentPlanConfig.name,
          price: currentPlanConfig.price
        },
        upgradeOptions,
        recommendation: upgradeOptions.length > 0 ? upgradeOptions[0] : null
      }
    });
  } catch (error) {
    console.error('Error fetching upgrade options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upgrade options'
    });
  }
});

// Simulate usage update (in production, this would be called when actions are performed)
router.post('/update-usage', (req, res) => {
  try {
    const { tenantId, action, data } = req.body;
    const tenant = mockTenants[tenantId];
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Update usage based on action
    switch (action) {
      case 'room_created':
        tenant.usage.roomsUsed++;
        break;
      case 'room_deleted':
        tenant.usage.roomsUsed = Math.max(0, tenant.usage.roomsUsed - 1);
        break;
      case 'booking_created':
        tenant.usage.bookingsThisMonth++;
        break;
      case 'booking_cancelled':
        tenant.usage.bookingsThisMonth = Math.max(0, tenant.usage.bookingsThisMonth - 1);
        break;
    }

    res.json({
      success: true,
      data: {
        message: 'Usage updated successfully',
        newUsage: tenant.usage
      }
    });
  } catch (error) {
    console.error('Error updating usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update usage'
    });
  }
});

// Get billing history (mock data)
router.get('/billing-history/:tenantId', (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = mockTenants[tenantId];
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Mock billing history
    const billingHistory = [
      {
        id: 'inv_001',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 0,
        status: 'paid',
        description: `${SUBSCRIPTION_PLANS[tenant.plan].name} Plan - Current Period`,
        period: 'Nov 2024'
      }
    ];

    res.json({
      success: true,
      data: {
        tenantId,
        currentPlan: tenant.plan,
        billingHistory,
        nextBillingDate: tenant.currentPeriodEnd,
        totalSpent: billingHistory.reduce((sum, invoice) => sum + invoice.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch billing history'
    });
  }
});

export default router;
