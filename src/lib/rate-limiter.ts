/**
 * Rate Limiter
 * 
 * Simple in-memory rate limiter for API routes
 * Prevents abuse and DDoS attacks
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  maxRequests: number
  
  /**
   * Time window in milliseconds
   */
  windowMs: number
  
  /**
   * Identifier for rate limiting (e.g., IP address, user ID)
   */
  identifier: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { maxRequests, windowMs, identifier } = config
  const now = Date.now()
  
  let entry = rateLimitStore.get(identifier)
  
  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs
    }
    rateLimitStore.set(identifier, entry)
  }
  
  // Increment count
  entry.count++
  
  // Check if over limit
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000) // seconds
    }
  }
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt
  }
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(identifier: string): RateLimitResult | null {
  const entry = rateLimitStore.get(identifier)
  
  if (!entry) {
    return null
  }
  
  const now = Date.now()
  
  if (entry.resetAt < now) {
    rateLimitStore.delete(identifier)
    return null
  }
  
  return {
    allowed: true, // Just checking status, not incrementing
    remaining: 0, // Don't expose actual count
    resetAt: entry.resetAt
  }
}

/**
 * Helper to get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (works with proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback to user agent + origin (less reliable but better than nothing)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const origin = request.headers.get('origin') || 'unknown'
  
  return `${origin}-${userAgent}`.substring(0, 100)
}
