class CacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.maxMemorySize = 1000 // Maximum number of items in memory cache
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes in milliseconds
  }

  // Generate cache key
  generateKey(prefix, ...params) {
    return `${prefix}:${params.map(p => 
      typeof p === 'object' ? JSON.stringify(p) : String(p)
    ).join(':')}`
  }

  // Memory cache operations
  setMemory(key, value, ttl = this.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
    }

    const expiry = Date.now() + ttl
    this.memoryCache.set(key, { value, expiry })
  }

  getMemory(key) {
    const item = this.memoryCache.get(key)
    
    if (!item) return null
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key)
      return null
    }
    
    return item.value
  }

  deleteMemory(key) {
    return this.memoryCache.delete(key)
  }

  clearMemory() {
    this.memoryCache.clear()
  }

  // Local storage cache operations
  setLocalStorage(key, value, ttl = this.defaultTTL) {
    try {
      const item = {
        value,
        expiry: Date.now() + ttl
      }
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error)
    }
  }

  getLocalStorage(key) {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)
      
      // Check if expired
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(key)
        return null
      }
      
      return parsed.value
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error)
      return null
    }
  }

  deleteLocalStorage(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to delete localStorage cache:', error)
    }
  }

  clearLocalStorage() {
    try {
      // Only clear our cache keys
      const keys = Object.keys(localStorage).filter(key => key.startsWith('boom-cache:'))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error)
    }
  }

  // Session storage cache operations
  setSessionStorage(key, value, ttl = this.defaultTTL) {
    try {
      const item = {
        value,
        expiry: Date.now() + ttl
      }
      sessionStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set sessionStorage cache:', error)
    }
  }

  getSessionStorage(key) {
    try {
      const item = sessionStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)
      
      // Check if expired
      if (Date.now() > parsed.expiry) {
        sessionStorage.removeItem(key)
        return null
      }
      
      return parsed.value
    } catch (error) {
      console.warn('Failed to get sessionStorage cache:', error)
      return null
    }
  }

  // High-level cache operations
  async get(key, fallbackFn, options = {}) {
    const {
      ttl = this.defaultTTL,
      useMemory = true,
      useLocalStorage = true,
      useSessionStorage = false,
      cachePrefix = 'boom-cache'
    } = options

    const cacheKey = `${cachePrefix}:${key}`

    // Try memory cache first
    if (useMemory) {
      const memoryValue = this.getMemory(cacheKey)
      if (memoryValue !== null) {
        return memoryValue
      }
    }

    // Try localStorage
    if (useLocalStorage) {
      const localValue = this.getLocalStorage(cacheKey)
      if (localValue !== null) {
        // Also store in memory for faster access
        if (useMemory) {
          this.setMemory(cacheKey, localValue, ttl)
        }
        return localValue
      }
    }

    // Try sessionStorage
    if (useSessionStorage) {
      const sessionValue = this.getSessionStorage(cacheKey)
      if (sessionValue !== null) {
        // Also store in memory and localStorage for faster access
        if (useMemory) {
          this.setMemory(cacheKey, sessionValue, ttl)
        }
        if (useLocalStorage) {
          this.setLocalStorage(cacheKey, sessionValue, ttl)
        }
        return sessionValue
      }
    }

    // Fallback to function
    if (fallbackFn) {
      try {
        const value = await fallbackFn()
        
        // Store in all enabled caches
        if (useMemory) {
          this.setMemory(cacheKey, value, ttl)
        }
        if (useLocalStorage) {
          this.setLocalStorage(cacheKey, value, ttl)
        }
        if (useSessionStorage) {
          this.setSessionStorage(cacheKey, value, ttl)
        }
        
        return value
      } catch (error) {
        console.error('Cache fallback function failed:', error)
        throw error
      }
    }

    return null
  }

  async set(key, value, options = {}) {
    const {
      ttl = this.defaultTTL,
      useMemory = true,
      useLocalStorage = true,
      useSessionStorage = false,
      cachePrefix = 'boom-cache'
    } = options

    const cacheKey = `${cachePrefix}:${key}`

    if (useMemory) {
      this.setMemory(cacheKey, value, ttl)
    }
    if (useLocalStorage) {
      this.setLocalStorage(cacheKey, value, ttl)
    }
    if (useSessionStorage) {
      this.setSessionStorage(cacheKey, value, ttl)
    }
  }

  async delete(key, options = {}) {
    const {
      useMemory = true,
      useLocalStorage = true,
      useSessionStorage = false,
      cachePrefix = 'boom-cache'
    } = options

    const cacheKey = `${cachePrefix}:${key}`

    if (useMemory) {
      this.deleteMemory(cacheKey)
    }
    if (useLocalStorage) {
      this.deleteLocalStorage(cacheKey)
    }
    if (useSessionStorage) {
      sessionStorage.removeItem(cacheKey)
    }
  }

  // Cache invalidation patterns
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
      }
    }

    // Clear localStorage
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (regex.test(key)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to invalidate localStorage pattern:', error)
    }

    // Clear sessionStorage
    try {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (regex.test(key)) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to invalidate sessionStorage pattern:', error)
    }
  }

  // Cache statistics
  getStats() {
    const memoryStats = {
      size: this.memoryCache.size,
      maxSize: this.maxMemorySize,
      usage: (this.memoryCache.size / this.maxMemorySize * 100).toFixed(2) + '%'
    }

    let localStats = { size: 0, keys: [] }
    let sessionStats = { size: 0, keys: [] }

    try {
      const localKeys = Object.keys(localStorage).filter(key => key.startsWith('boom-cache:'))
      localStats = {
        size: localKeys.length,
        keys: localKeys
      }
    } catch (error) {
      console.warn('Failed to get localStorage stats:', error)
    }

    try {
      const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('boom-cache:'))
      sessionStats = {
        size: sessionKeys.length,
        keys: sessionKeys
      }
    } catch (error) {
      console.warn('Failed to get sessionStorage stats:', error)
    }

    return {
      memory: memoryStats,
      localStorage: localStats,
      sessionStorage: sessionStats
    }
  }

  // Clear all caches
  clearAll() {
    this.clearMemory()
    this.clearLocalStorage()
    
    try {
      const keys = Object.keys(sessionStorage).filter(key => key.startsWith('boom-cache:'))
      keys.forEach(key => sessionStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear sessionStorage cache:', error)
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager()

// Cache utility functions for common use cases
export const cacheUtils = {
  // API response caching
  async cacheApiResponse(url, fetchFn, ttl = 5 * 60 * 1000) {
    return cacheManager.get(url, fetchFn, {
      ttl,
      useMemory: true,
      useLocalStorage: true,
      cachePrefix: 'api'
    })
  },

  // User data caching
  async cacheUserData(userId, fetchFn, ttl = 15 * 60 * 1000) {
    return cacheManager.get(`user:${userId}`, fetchFn, {
      ttl,
      useMemory: true,
      useLocalStorage: true,
      cachePrefix: 'user'
    })
  },

  // Settings caching
  async cacheSettings(tenantId, fetchFn, ttl = 30 * 60 * 1000) {
    return cacheManager.get(`settings:${tenantId}`, fetchFn, {
      ttl,
      useMemory: true,
      useLocalStorage: true,
      cachePrefix: 'settings'
    })
  },

  // Room data caching
  async cacheRooms(tenantId, fetchFn, ttl = 10 * 60 * 1000) {
    return cacheManager.get(`rooms:${tenantId}`, fetchFn, {
      ttl,
      useMemory: true,
      useLocalStorage: true,
      cachePrefix: 'rooms'
    })
  },

  // Booking data caching
  async cacheBookings(tenantId, date, fetchFn, ttl = 2 * 60 * 1000) {
    return cacheManager.get(`bookings:${tenantId}:${date}`, fetchFn, {
      ttl,
      useMemory: true,
      useLocalStorage: false, // Don't cache bookings in localStorage for privacy
      cachePrefix: 'bookings'
    })
  }
}
