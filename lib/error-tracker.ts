/**
 * Error tracking and reporting system for Gitivity
 * Provides centralized error handling with context and aggregation
 */

import { logger } from "./logger"

export interface ErrorContext {
  userId?: string
  username?: string
  operation?: string
  component?: string
  url?: string
  userAgent?: string
  sessionId?: string
  [key: string]: unknown
}

export interface ErrorReport {
  id: string
  timestamp: string
  message: string
  stack?: string
  name: string
  context?: ErrorContext
  fingerprint: string
  count: number
  firstSeen: string
  lastSeen: string
}

class ErrorTracker {
  private errorStore = new Map<string, ErrorReport>()
  private reportQueue: ErrorReport[] = []
  private maxQueueSize = 100

  /**
   * Generate a fingerprint for error deduplication
   */
  private generateFingerprint(error: Error, context?: ErrorContext): string {
    const key = [
      error.name,
      error.message,
      context?.operation,
      context?.component
    ].filter(Boolean).join('|')
    
    // Simple hash function
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Track an error with context
   */
  track(error: Error, context?: ErrorContext): void {
    const timestamp = new Date().toISOString()
    const fingerprint = this.generateFingerprint(error, context)
    const reportId = `${fingerprint}_${Date.now()}`

    // Check if we've seen this error before
    const existingReport = this.errorStore.get(fingerprint)

    if (existingReport) {
      // Update existing report
      existingReport.count++
      existingReport.lastSeen = timestamp
      existingReport.context = { ...existingReport.context, ...context }
    } else {
      // Create new report
      const report: ErrorReport = {
        id: reportId,
        timestamp,
        message: error.message,
        stack: error.stack,
        name: error.name,
        context,
        fingerprint,
        count: 1,
        firstSeen: timestamp,
        lastSeen: timestamp
      }

      this.errorStore.set(fingerprint, report)
      this.addToQueue(report)
    }

    // Always log the error
    logger.error('Error tracked', {
      errorId: reportId,
      fingerprint,
      operation: context?.operation,
      component: context?.component,
      username: context?.username
    }, error)
  }

  /**
   * Add error to report queue for batch processing
   */
  private addToQueue(report: ErrorReport): void {
    this.reportQueue.push(report)
    
    // Keep queue size manageable
    if (this.reportQueue.length > this.maxQueueSize) {
      this.reportQueue.shift()
    }
  }

  /**
   * Get error statistics
   */
  getStats(): { totalErrors: number; uniqueErrors: number; recentErrors: number } {
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)
    
    let totalErrors = 0
    let recentErrors = 0
    
    for (const report of this.errorStore.values()) {
      totalErrors += report.count
      if (new Date(report.lastSeen).getTime() > oneHourAgo) {
        recentErrors += report.count
      }
    }

    return {
      totalErrors,
      uniqueErrors: this.errorStore.size,
      recentErrors
    }
  }

  /**
   * Get top errors by frequency
   */
  getTopErrors(limit: number = 10): ErrorReport[] {
    return Array.from(this.errorStore.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * Get recent error reports
   */
  getRecentErrors(hours: number = 1): ErrorReport[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000)
    
    return Array.from(this.errorStore.values())
      .filter(report => new Date(report.lastSeen).getTime() > cutoff)
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
  }

  /**
   * Clear old errors from memory (cleanup)
   */
  cleanup(olderThanHours: number = 24): void {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000)
    
    for (const [fingerprint, report] of this.errorStore.entries()) {
      if (new Date(report.lastSeen).getTime() < cutoff) {
        this.errorStore.delete(fingerprint)
      }
    }

    logger.info('Error tracker cleanup completed', {
      remainingErrors: this.errorStore.size
    })
  }

  /**
   * Export errors for external monitoring services
   */
  exportErrors(): ErrorReport[] {
    return Array.from(this.errorStore.values())
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker()

/**
 * Convenience wrapper for tracking errors with automatic context
 */
export function trackError(error: Error, context?: ErrorContext): void {
  errorTracker.track(error, context)
}

/**
 * Decorator for automatic error tracking in async functions
 */
export function withErrorTracking<T extends unknown[], R>(
  operation: string,
  component?: string
) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: T): Promise<R> {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        trackError(error as Error, {
          operation,
          component,
          method: propertyKey
        })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Wrapper function for tracking errors in any function
 */
export async function withErrorContext<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    trackError(error as Error, {
      ...context,
      operation
    })
    throw error
  }
}

// Auto-cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    errorTracker.cleanup()
  }, 60 * 60 * 1000) // 1 hour
}