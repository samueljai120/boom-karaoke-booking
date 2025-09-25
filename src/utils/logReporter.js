/**
 * Client-side logging reporter for error tracking and analytics
 * Provides a simple logging interface that can be extended for production use
 */

class LogReporter {
  constructor() {
    this.enabled = false;
    this.logs = [];
    this.maxLogs = 1000; // Prevent memory leaks
  }

  /**
   * Initialize the log reporter
   * @param {Object} config - Configuration options
   * @param {boolean} config.enabled - Whether logging is enabled
   * @param {number} config.maxLogs - Maximum number of logs to keep in memory
   */
  init(config = {}) {
    this.enabled = config.enabled || false;
    this.maxLogs = config.maxLogs || 1000;
    
    if (this.enabled) {
      this.setupErrorHandlers();
      // LogReporter initialized and enabled
    }
  }

  /**
   * Setup global error handlers
   */
  setupErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', 'Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
        stack: event.reason?.stack
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.log('error', 'JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.log('error', 'Resource Loading Error', {
          type: event.target.tagName,
          src: event.target.src || event.target.href,
          message: event.message
        });
      }
    }, true);
  }

  /**
   * Log a message with optional data
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  log(level, message, data = {}) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      // Console logging removed for clean version
    }

    // In production, you might want to send logs to a service
    this.sendToService(logEntry);
  }

  /**
   * Send log entry to external service (placeholder for production implementation)
   * @param {Object} logEntry - The log entry to send
   */
  sendToService(logEntry) {
    // Placeholder for production logging service integration
    // Examples: Sentry, LogRocket, DataDog, etc.
    
    // For now, we'll just store in localStorage for debugging
    if (typeof Storage !== 'undefined') {
      try {
        const storedLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        storedLogs.push(logEntry);
        
        // Keep only last 100 logs in localStorage
        if (storedLogs.length > 100) {
          storedLogs.splice(0, storedLogs.length - 100);
        }
        
        localStorage.setItem('app_logs', JSON.stringify(storedLogs));
      } catch (error) {
        // Failed to store log in localStorage - error handling removed for clean version
      }
    }
  }

  /**
   * Get all stored logs
   * @returns {Array} Array of log entries
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Clear all stored logs
   */
  clearLogs() {
    this.logs = [];
    if (typeof Storage !== 'undefined') {
      localStorage.removeItem('app_logs');
    }
  }

  /**
   * Log an info message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  info(message, data) {
    this.log('info', message, data);
  }

  /**
   * Log a warning message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  warn(message, data) {
    this.log('warn', message, data);
  }

  /**
   * Log an error message
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   */
  error(message, data) {
    this.log('error', message, data);
  }
}

// Create a singleton instance
const logReporter = new LogReporter();

/**
 * Initialize the client log reporter
 * @param {Object} config - Configuration options
 */
export function initClientLogReporter(config = {}) {
  logReporter.init(config);
}

/**
 * Get the log reporter instance
 * @returns {LogReporter} The log reporter instance
 */
export function getLogReporter() {
  return logReporter;
}

// Export the class for advanced usage
export { LogReporter };

// Default export
export default logReporter;
