import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

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

// Get subscription plans
router.get('/plans', (req, res) => {
  try {
    res.json({
      success: true,
      data: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription plans'
    });
  }
});

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment processing is not configured. Please contact support.'
      });
    }

    const { plan, customerEmail, tenantId } = req.body;

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription plan'
      });
    }

    const planConfig = SUBSCRIPTION_PLANS[plan];

    // Create Stripe price if it doesn't exist
    let priceId;
    try {
      const prices = await stripe.prices.list({
        active: true,
        product_data: {
          name: `${planConfig.name} Plan`
        }
      });

      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        const product = await stripe.products.create({
          name: `${planConfig.name} Plan`,
          description: `Boom Booking ${planConfig.name} subscription`
        });

        const price = await stripe.prices.create({
          unit_amount: planConfig.price * 100, // Convert to cents
          currency: 'usd',
          recurring: { interval: 'month' },
          product: product.id
        });

        priceId = price.id;
      }
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create Stripe price'
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        tenantId: tenantId,
        plan: plan
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// Handle successful payment
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      error: 'Payment processing is not configured'
    });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment succeeded:', session.id);
        
        // Update tenant subscription status
        // This would typically update the database
        // await updateTenantSubscription(session.metadata.tenantId, session.metadata.plan);
        
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice.id);
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Invoice payment failed:', failedInvoice.id);
        
        // Handle failed payment
        // This would typically send notification and update subscription status
        
        break;
      
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        console.log('Subscription canceled:', subscription.id);
        
        // Handle subscription cancellation
        // This would typically update the tenant's subscription status
        
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Get subscription status
router.get('/subscription/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // This would typically fetch from database
    // For now, return a mock response
    res.json({
      success: true,
      data: {
        tenantId,
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usage: {
          rooms: 1,
          bookingsThisMonth: 15,
          limit: SUBSCRIPTION_PLANS.free.bookingsPerMonth
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription status'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment processing is not configured. Please contact support.'
      });
    }

    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID is required'
      });
    }

    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    
    res.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        canceledAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

export default router;
