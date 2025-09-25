import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.observers = []
    this.isEnabled = process.env.NODE_ENV === 'production'
  }

  init() {
    if (!this.isEnabled) return

    // Core Web Vitals
    getCLS(this.handleMetric.bind(this))
    getFID(this.handleMetric.bind(this))
    getFCP(this.handleMetric.bind(this))
    getLCP(this.handleMetric.bind(this))
    getTTFB(this.handleMetric.bind(this))

    // Custom metrics
    this.observeNavigationTiming()
    this.observeResourceTiming()
  }

  handleMetric(metric) {
    this.metrics[metric.name] = {
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now()
    }

    // Send to analytics service
    this.sendToAnalytics(metric)
  }

  observeNavigationTiming() {
    if (!('performance' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          this.metrics.navigation = {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            domInteractive: entry.domInteractive - entry.navigationStart,
            firstByte: entry.responseStart - entry.requestStart,
            timestamp: Date.now()
          }
        }
      })
    })

    observer.observe({ entryTypes: ['navigation'] })
    this.observers.push(observer)
  }

  observeResourceTiming() {
    if (!('performance' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceType = this.getResourceType(entry.name)
          
          if (!this.metrics.resources) {
            this.metrics.resources = {}
          }
          
          if (!this.metrics.resources[resourceType]) {
            this.metrics.resources[resourceType] = {
              count: 0,
              totalSize: 0,
              totalTime: 0,
              avgTime: 0
            }
          }
          
          const resource = this.metrics.resources[resourceType]
          resource.count++
          resource.totalSize += entry.transferSize || 0
          resource.totalTime += entry.duration
          resource.avgTime = resource.totalTime / resource.count
        }
      })
    })

    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }

  getResourceType(url) {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'css'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.svg')) return 'images'
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf')) return 'fonts'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  sendToAnalytics(metric) {
    // Send to your analytics service (Google Analytics, Mixpanel, etc.)
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true
      })
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        url: window.location.href,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.warn('Failed to send performance metric:', error)
    })
  }

  getMetrics() {
    return { ...this.metrics }
  }

  getCoreWebVitals() {
    return {
      CLS: this.metrics.CLS?.value,
      FID: this.metrics.FID?.value,
      FCP: this.metrics.FCP?.value,
      LCP: this.metrics.LCP?.value,
      TTFB: this.metrics.TTFB?.value
    }
  }

  getPerformanceScore() {
    const vitals = this.getCoreWebVitals()
    let score = 100

    // LCP scoring (0-100)
    if (vitals.LCP <= 2500) score -= 0
    else if (vitals.LCP <= 4000) score -= 10
    else score -= 20

    // FID scoring (0-100)
    if (vitals.FID <= 100) score -= 0
    else if (vitals.FID <= 300) score -= 10
    else score -= 20

    // CLS scoring (0-100)
    if (vitals.CLS <= 0.1) score -= 0
    else if (vitals.CLS <= 0.25) score -= 10
    else score -= 20

    return Math.max(0, score)
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.init()
}
