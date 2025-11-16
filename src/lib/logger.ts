/**
 * Enhanced Logger
 * 
 * Structured logging for better debugging and monitoring
 */

type LogLevel = 'info' | 'warn' | 'error' | 'security'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  
  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    
    let logString = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    if (context && Object.keys(context).length > 0) {
      logString += `\nContext: ${JSON.stringify(context, null, 2)}`
    }
    
    if (error) {
      logString += `\nError: ${error.message}`
      if (error.stack && this.isDevelopment) {
        logString += `\nStack: ${error.stack}`
      }
    }
    
    return logString
  }
  
  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    }
    
    const formatted = this.formatLog(entry)
    
    switch (level) {
      case 'error':
      case 'security':
        console.error(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      default:
        console.log(formatted)
    }
    
    // In production, you could send to monitoring service here
    if (!this.isDevelopment && level === 'security') {
      // TODO: Send to security monitoring service
      // Example: Sentry, DataDog, CloudWatch, etc.
    }
  }
  
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }
  
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }
  
  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('error', message, context, error)
  }
  
  security(message: string, context?: Record<string, any>) {
    this.log('security', `🚨 SECURITY EVENT: ${message}`, context)
  }
  
  oauth(message: string, context?: Record<string, any>) {
    this.log('info', `🔐 OAuth: ${message}`, context)
  }
  
  sync(message: string, context?: Record<string, any>) {
    this.log('info', `🔄 Sync: ${message}`, context)
  }
  
  api(message: string, context?: Record<string, any>) {
    this.log('info', `📡 API: ${message}`, context)
  }
}

export const logger = new Logger()

// Helper to safely log request info
export function getRequestInfo(request: Request) {
  return {
    method: request.method,
    url: request.url,
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'origin': request.headers.get('origin'),
      'referer': request.headers.get('referer'),
    }
  }
}
