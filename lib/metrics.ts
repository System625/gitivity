/**
 * Performance metrics collection and monitoring system for Gitivity
 * Tracks operation timings, throughput, and system health
 */

import { logger } from "./logger"

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  labels?: Record<string, string>
}

export interface OperationMetrics {
  name: string
  count: number
  totalTime: number
  avgTime: number
  minTime: number
  maxTime: number
  p95Time: number
  errorCount: number
  successRate: number
  throughput: number // operations per second
  lastExecuted: string
  timings: number[] // Store recent timings for percentile calculations
}

class MetricsCollector {
  private metrics = new Map<string, OperationMetrics>()
  private customMetrics: PerformanceMetric[] = []
  private maxTimingsHistory = 100 // Keep last 100 timings for percentile calculations
  private startTime = Date.now()

  /**
   * Record timing for an operation
   */
  recordTiming(operationName: string, duration: number, success: boolean = true, labels?: Record<string, string>): void {
    const timestamp = new Date().toISOString()
    const metricKey = this.getMetricKey(operationName, labels)
    
    let metric = this.metrics.get(metricKey)
    
    if (!metric) {
      metric = {
        name: operationName,
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        p95Time: 0,
        errorCount: 0,
        successRate: 100,
        throughput: 0,
        lastExecuted: timestamp,
        timings: []
      }
      this.metrics.set(metricKey, metric)
    }

    // Update timing stats
    metric.count++
    metric.totalTime += duration
    metric.avgTime = metric.totalTime / metric.count
    metric.minTime = Math.min(metric.minTime, duration)
    metric.maxTime = Math.max(metric.maxTime, duration)
    metric.lastExecuted = timestamp

    // Track success/error rates
    if (!success) {
      metric.errorCount++
    }
    metric.successRate = ((metric.count - metric.errorCount) / metric.count) * 100

    // Add to timings history (keep only recent ones)
    metric.timings.push(duration)
    if (metric.timings.length > this.maxTimingsHistory) {
      metric.timings.shift()
    }

    // Calculate p95
    metric.p95Time = this.calculatePercentile(metric.timings, 95)

    // Calculate throughput (operations per second over last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    const recentOperations = metric.count // Simplified - could track timestamps
    metric.throughput = recentOperations / 3600 // rough estimate

    // Log performance warnings
    if (duration > 5000) { // Operations taking more than 5 seconds
      logger.warn('Slow operation detected', {
        operation: operationName,
        duration,
        labels
      })
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number, unit: string, labels?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      labels
    }

    this.customMetrics.push(metric)

    // Keep only recent custom metrics (last hour)
    const cutoff = Date.now() - (60 * 60 * 1000)
    this.customMetrics = this.customMetrics.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    )
  }

  /**
   * Time an async operation and record metrics
   */
  async time<T>(
    operationName: string, 
    operation: () => Promise<T>,
    labels?: Record<string, string>
  ): Promise<T> {
    const startTime = performance.now()
    let success = true

    try {
      const result = await operation()
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = performance.now() - startTime
      this.recordTiming(operationName, duration, success, labels)
    }
  }

  /**
   * Get operation metrics
   */
  getOperationMetrics(operationName?: string): OperationMetrics[] {
    const results = Array.from(this.metrics.values())
    
    if (operationName) {
      return results.filter(m => m.name === operationName)
    }
    
    return results.sort((a, b) => b.count - a.count)
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): {
    uptime: number
    totalOperations: number
    avgResponseTime: number
    errorRate: number
    operationsPerSecond: number
  } {
    const now = Date.now()
    const uptime = now - this.startTime
    
    let totalOperations = 0
    let totalTime = 0
    let totalErrors = 0

    for (const metric of this.metrics.values()) {
      totalOperations += metric.count
      totalTime += metric.totalTime
      totalErrors += metric.errorCount
    }

    return {
      uptime,
      totalOperations,
      avgResponseTime: totalOperations > 0 ? totalTime / totalOperations : 0,
      errorRate: totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0,
      operationsPerSecond: totalOperations / (uptime / 1000)
    }
  }

  /**
   * Get top slowest operations
   */
  getSlowestOperations(limit: number = 10): OperationMetrics[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit)
  }

  /**
   * Get operations with highest error rates
   */
  getHighErrorOperations(limit: number = 10): OperationMetrics[] {
    return Array.from(this.metrics.values())
      .filter(m => m.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit)
  }

  /**
   * Export all metrics for monitoring systems
   */
  exportMetrics() {
    return {
      operations: this.getOperationMetrics(),
      custom: this.customMetrics,
      system: this.getSystemHealth()
    }
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.metrics.clear()
    this.customMetrics = []
    this.startTime = Date.now()
  }

  private getMetricKey(operationName: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return operationName
    }
    
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',')
    
    return `${operationName}{${labelString}}`
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }
}

// Export singleton instance
export const metrics = new MetricsCollector()

/**
 * Decorator for automatic performance tracking
 */
export function withMetrics(operationName: string, labels?: Record<string, string>) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      return await metrics.time(operationName, async () => {
        return await originalMethod.apply(this, args)
      }, labels)
    }

    return descriptor
  }
}

/**
 * Record GitHub API rate limit metrics
 */
export function recordRateLimit(remaining: number, resetAt: string): void {
  metrics.recordMetric('github_rate_limit_remaining', remaining, 'count', {
    source: 'github-api'
  })
  
  const resetTime = new Date(resetAt).getTime()
  const timeUntilReset = Math.max(0, resetTime - Date.now())
  metrics.recordMetric('github_rate_limit_reset_seconds', timeUntilReset / 1000, 'seconds', {
    source: 'github-api'
  })
}

/**
 * Record database query metrics
 */
export function recordDatabaseMetric(operation: string, duration: number, success: boolean = true): void {
  metrics.recordTiming('database_query', duration, success, {
    operation
  })
}