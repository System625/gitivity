/**
 * Structured logging utility for Gitivity application
 * Provides consistent logging format across the application with context and metadata
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  userId?: string
  username?: string
  requestId?: string
  operation?: string
  duration?: number
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private minLevel: LogLevel

  constructor() {
    // Set log level based on environment
    this.minLevel = process.env.NODE_ENV === 'production' 
      ? LogLevel.INFO 
      : LogLevel.DEBUG
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
    }

    if (context && Object.keys(context).length > 0) {
      entry.context = context
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    return entry
  }

  private output(entry: LogEntry): void {
    const output = JSON.stringify(entry)
    
    switch (entry.level) {
      case 'ERROR':
        console.error(output)
        break
      case 'WARN':
        console.warn(output)
        break
      case 'INFO':
        console.info(output)
        break
      case 'DEBUG':
      default:
        console.log(output)
        break
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.formatLog(LogLevel.DEBUG, message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.formatLog(LogLevel.INFO, message, context))
    }
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.formatLog(LogLevel.WARN, message, context, error))
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.formatLog(LogLevel.ERROR, message, context, error))
    }
  }

  /**
   * Create a child logger with additional context that will be included in all logs
   */
  child(additionalContext: LogContext): Logger {
    const childLogger = new Logger()
    
    // Override the formatLog method to include additional context
    const originalFormatLog = childLogger.formatLog.bind(childLogger)
    childLogger.formatLog = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
      const mergedContext = { ...additionalContext, ...context }
      return originalFormatLog(level, message, mergedContext, error)
    }
    
    return childLogger
  }

  /**
   * Time a function execution and log the duration
   */
  async timeAsync<T>(
    operation: string, 
    fn: () => Promise<T>, 
    context?: LogContext
  ): Promise<T> {
    const startTime = Date.now()
    const operationContext = { ...context, operation }
    
    this.debug(`Starting operation: ${operation}`, operationContext)
    
    try {
      const result = await fn()
      const duration = Date.now() - startTime
      
      this.info(`Operation completed: ${operation}`, {
        ...operationContext,
        duration,
        status: 'success'
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      this.error(`Operation failed: ${operation}`, {
        ...operationContext,
        duration,
        status: 'error'
      }, error as Error)
      
      throw error
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience methods for common operations
export const createUserLogger = (username: string) => 
  logger.child({ username })

export const createRequestLogger = (requestId: string) => 
  logger.child({ requestId })