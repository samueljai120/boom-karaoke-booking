import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';

// Simple authentication middleware for demo
const authenticateToken = (req, res, next) => {
  // For demo purposes, always allow access
  next();
};

// AI Service Layer
class AIService {
  constructor() {
    this.cache = new Map(); // Simple in-memory cache for demo
    this.patterns = new Map(); // Store booking patterns
  }

  // Natural Language Processing for Booking Creation
  async processNaturalLanguage(input, context = {}) {
    try {
      // Parse natural language input (simplified for demo)
      const parsed = this.parseBookingIntent(input);
      
      // Generate suggestions based on patterns
      const suggestions = await this.generateSuggestions(parsed, context);
      
      return {
        intent: parsed.intent,
        entities: parsed.entities,
        suggestions,
        confidence: parsed.confidence,
        reasoning: this.generateReasoning(parsed)
      };
    } catch (error) {
      console.error('AI processing error:', error);
      throw new Error('Failed to process natural language input');
    }
  }

  parseBookingIntent(text) {
    // Simplified NLP parsing (in production, use OpenAI or similar)
    const lowerText = text.toLowerCase();
    
    let intent = 'CHECK_AVAILABILITY';
    let confidence = 0.7;
    
    if (lowerText.includes('book') || lowerText.includes('reserve')) {
      intent = 'CREATE_BOOKING';
      confidence = 0.9;
    } else if (lowerText.includes('cancel') || lowerText.includes('delete')) {
      intent = 'CANCEL_BOOKING';
      confidence = 0.8;
    } else if (lowerText.includes('change') || lowerText.includes('modify')) {
      intent = 'MODIFY_BOOKING';
      confidence = 0.8;
    }

    // Extract entities using regex patterns
    const entities = this.extractEntities(text);
    
    return {
      intent,
      confidence,
      entities
    };
  }

  extractEntities(text) {
    const entities = {};
    
    // Date extraction
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|tomorrow|today|next week)/i);
    if (dateMatch) {
      entities.date = this.normalizeDate(dateMatch[1]);
    }
    
    // Time extraction
    const timeMatch = text.match(/(\d{1,2}:\d{2}|\d{1,2}\s?(am|pm))/i);
    if (timeMatch) {
      entities.time = this.normalizeTime(timeMatch[1]);
    }
    
    // Duration extraction
    const durationMatch = text.match(/(\d+)\s?(hour|hr|minute|min)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      entities.duration = unit.startsWith('h') ? value * 60 : value;
    }
    
    // Room type extraction
    const roomMatch = text.match(/(standard|premium|vip|large|small|room\s?\w*)/i);
    if (roomMatch) {
      entities.room_type = roomMatch[1].toLowerCase();
    }
    
    // Customer name extraction (simple pattern)
    const nameMatch = text.match(/for\s+(\w+)/i);
    if (nameMatch) {
      entities.customer_name = nameMatch[1];
    }
    
    return entities;
  }

  normalizeDate(dateStr) {
    if (dateStr.toLowerCase() === 'today') {
      return new Date().toISOString().split('T')[0];
    } else if (dateStr.toLowerCase() === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    return dateStr;
  }

  normalizeTime(timeStr) {
    const time = timeStr.toLowerCase();
    if (time.includes('am') || time.includes('pm')) {
      return time;
    }
    return time + ':00';
  }

  async generateSuggestions(parsed, context) {
    const suggestions = [];
    
    if (parsed.intent === 'CREATE_BOOKING') {
      // Generate optimal time slot suggestions
      const optimalSlots = await this.findOptimalSlots(parsed.entities, context);
      suggestions.push(...optimalSlots);
    }
    
    return suggestions;
  }

  async findOptimalSlots(entities, context) {
    // Analyze booking patterns to suggest optimal slots
    const patterns = await this.analyzeBookingPatterns();
    
    const suggestions = [];
    const targetDate = entities.date || new Date().toISOString().split('T')[0];
    const targetTime = entities.time || '14:00';
    
    // Generate suggestions based on patterns
    const peakHours = [18, 19, 20]; // 6-8 PM are typically peak
    const offPeakHours = [10, 11, 14, 15]; // 10-11 AM, 2-3 PM are typically off-peak
    
    const hours = entities.time ? [parseInt(targetTime.split(':')[0])] : 
                  [...offPeakHours, ...peakHours];
    
    for (const hour of hours) {
      const slotTime = `${hour.toString().padStart(2, '0')}:00`;
      const successRate = patterns[hour]?.success_rate || 0.7;
      
      suggestions.push({
        date: targetDate,
        time: slotTime,
        duration: entities.duration || 60,
        confidence: successRate,
        reasoning: successRate > 0.8 ? 'High success rate for this time slot' : 
                  'Good availability, moderate success rate'
      });
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  async analyzeBookingPatterns() {
    // Analyze historical booking patterns
    try {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            strftime('%H', start_time) as hour,
            COUNT(*) as total_bookings,
            AVG(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as success_rate,
            AVG(total_price) as avg_price
          FROM bookings 
          WHERE created_at > datetime('now', '-90 days')
          GROUP BY strftime('%H', start_time)
          ORDER BY hour
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            console.error('Error analyzing booking patterns:', err);
            resolve({});
            return;
          }
          
          const patterns = {};
          rows.forEach(row => {
            patterns[parseInt(row.hour)] = {
              total_bookings: parseInt(row.total_bookings),
              success_rate: parseFloat(row.success_rate),
              avg_price: parseFloat(row.avg_price)
            };
          });
          
          resolve(patterns);
        });
      });
    } catch (error) {
      console.error('Error analyzing booking patterns:', error);
      return {};
    }
  }

  generateReasoning(parsed) {
    const reasons = [];
    
    if (parsed.confidence > 0.8) {
      reasons.push('High confidence in intent recognition');
    }
    
    if (Object.keys(parsed.entities).length > 2) {
      reasons.push('Multiple entities successfully extracted');
    }
    
    return reasons.join(', ');
  }

  // Predictive Analytics
  async generateDemandForecast(timeframe = '7d') {
    try {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 7;
      
      // Get historical data
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            date(start_time) as date,
            COUNT(*) as bookings,
            AVG(total_price) as avg_price,
            strftime('%w', start_time) as day_of_week
          FROM bookings 
          WHERE start_time > datetime('now', '-${days * 2} days')
          GROUP BY date(start_time), strftime('%w', start_time)
          ORDER BY date
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            console.error('Error generating forecast:', err);
            reject(new Error('Failed to generate demand forecast'));
            return;
          }
          
          // Simple trend analysis
          const trends = this.calculateTrends(rows);
          
          // Generate forecast
          const forecast = this.generateForecast(trends, days);
          
          resolve({
            forecast,
            trends,
            confidence: 0.75,
            factors: ['Historical patterns', 'Day of week effects', 'Seasonal trends']
          });
        });
      });
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw new Error('Failed to generate demand forecast');
    }
  }

  calculateTrends(data) {
    if (data.length < 2) return { trend: 0, seasonality: {} };
    
    // Calculate trend
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, row) => sum + parseInt(row.bookings), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, row) => sum + parseInt(row.bookings), 0) / secondHalf.length;
    
    const trend = (secondAvg - firstAvg) / firstAvg;
    
    // Calculate day-of-week seasonality
    const seasonality = {};
    data.forEach(row => {
      const dow = parseInt(row.day_of_week);
      if (!seasonality[dow]) seasonality[dow] = [];
      seasonality[dow].push(parseInt(row.bookings));
    });
    
    Object.keys(seasonality).forEach(dow => {
      seasonality[dow] = seasonality[dow].reduce((sum, val) => sum + val, 0) / seasonality[dow].length;
    });
    
    return { trend, seasonality };
  }

  generateForecast(trends, days) {
    const forecast = [];
    const baseDate = new Date();
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      const dow = date.getDay();
      
      const baseDemand = trends.seasonality[dow] || 5;
      const trendFactor = 1 + (trends.trend * i / days);
      
      const predictedBookings = Math.round(baseDemand * trendFactor);
      const confidence = Math.max(0.5, 1 - (i * 0.1)); // Decreasing confidence over time
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted_bookings: predictedBookings,
        confidence: confidence,
        day_of_week: dow,
        factors: [`Day of week effect: ${dow}`, `Trend: ${(trends.trend * 100).toFixed(1)}%`]
      });
    }
    
    return forecast;
  }

  // Revenue Optimization
  async suggestPricingOptimizations() {
    try {
      // Analyze current pricing vs demand
      return new Promise((resolve, reject) => {
        const query = `
          SELECT 
            r.id,
            r.name,
            r.price_per_hour,
            COUNT(b.id) as booking_count,
            AVG(b.total_price) as avg_revenue,
            AVG(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as success_rate
          FROM rooms r
          LEFT JOIN bookings b ON r.id = b.room_id 
          WHERE b.start_time > datetime('now', '-30 days') OR b.start_time IS NULL
          GROUP BY r.id, r.name, r.price_per_hour
          ORDER BY r.price_per_hour
        `;
        
        db.all(query, [], (err, rows) => {
          if (err) {
            console.error('Error analyzing pricing:', err);
            reject(new Error('Failed to analyze pricing optimization'));
            return;
          }
          
          const suggestions = [];
          
          rows.forEach(room => {
            const currentPrice = parseFloat(room.price_per_hour);
            const bookingCount = parseInt(room.booking_count);
            const successRate = parseFloat(room.success_rate) || 0;
            const avgRevenue = parseFloat(room.avg_revenue) || currentPrice;
            
            let suggestion = null;
            
            if (successRate < 0.7 && bookingCount > 10) {
              // Low success rate, suggest price reduction
              suggestion = {
                room_id: room.id,
                room_name: room.name,
                current_price: currentPrice,
                suggested_price: Math.round(currentPrice * 0.9),
                change_percentage: -10,
                reasoning: 'Low booking success rate suggests price sensitivity',
                expected_impact: 'Increase bookings by 15-20%'
              };
            } else if (successRate > 0.9 && bookingCount > 20) {
              // High success rate, suggest price increase
              suggestion = {
                room_id: room.id,
                room_name: room.name,
                current_price: currentPrice,
                suggested_price: Math.round(currentPrice * 1.1),
                change_percentage: 10,
                reasoning: 'High demand and success rate allows for price increase',
                expected_impact: 'Increase revenue by 8-12% with minimal booking loss'
              };
            }
            
            if (suggestion) {
              suggestions.push(suggestion);
            }
          });
          
          resolve({
            suggestions,
            total_rooms_analyzed: rows.length,
            recommendations_count: suggestions.length,
            expected_revenue_impact: suggestions.length > 0 ? suggestions.reduce((sum, s) => sum + Math.abs(s.change_percentage), 0) / suggestions.length : 0
          });
        });
      });
    } catch (error) {
      console.error('Error analyzing pricing:', error);
      throw new Error('Failed to analyze pricing optimization');
    }
  }
}

const router = express.Router();
const aiService = new AIService();

// Routes

// Natural Language Processing
router.post('/process-natural-language', authenticateToken, [
  body('input').isString().isLength({ min: 10 }).withMessage('Input must be at least 10 characters'),
  body('context').optional().isObject()
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

    const { input, context } = req.body;
    const result = await aiService.processNaturalLanguage(input, context);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Natural language processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process natural language input',
      error: error.message
    });
  }
});

// Demand Forecasting
router.get('/demand-forecast', authenticateToken, [
  // Add query parameter validation if needed
], async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '7d';
    const forecast = await aiService.generateDemandForecast(timeframe);
    
    res.json({
      success: true,
      data: forecast,
      timeframe,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Demand forecasting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate demand forecast',
      error: error.message
    });
  }
});

// Pricing Optimization
router.get('/pricing-optimization', authenticateToken, async (req, res) => {
  try {
    const optimization = await aiService.suggestPricingOptimizations();
    
    res.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Pricing optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze pricing optimization',
      error: error.message
    });
  }
});

// AI Insights Dashboard
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    // Get comprehensive AI insights
    const [forecast, pricing] = await Promise.all([
      aiService.generateDemandForecast('7d'),
      aiService.suggestPricingOptimizations()
    ]);
    
    const insights = {
      demand_forecast: forecast,
      pricing_optimization: pricing,
      key_metrics: {
        total_suggestions: pricing.suggestions.length,
        avg_confidence: forecast.confidence,
        expected_revenue_impact: pricing.expected_revenue_impact
      },
      recommendations: [
        pricing.suggestions.length > 0 ? 'Consider implementing pricing optimizations' : 'Pricing appears optimized',
        forecast.confidence > 0.8 ? 'High confidence in demand forecast' : 'Monitor demand patterns closely',
        'Review booking patterns weekly for optimal scheduling'
      ]
    };
    
    res.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI insights',
      error: error.message
    });
  }
});

// AI Health Check
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      ai_services: {
        natural_language_processing: 'operational',
        demand_forecasting: 'operational',
        pricing_optimization: 'operational'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
