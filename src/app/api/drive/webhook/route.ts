import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Google Drive Webhook Handler
 * 
 * Receives push notifications from Google Drive when files change
 * This eliminates the need for polling and provides real-time sync
 */

export async function POST(request: NextRequest) {
  try {
    // Verify webhook headers
    const resourceState = request.headers.get('X-Goog-Resource-State')
    const resourceId = request.headers.get('X-Goog-Resource-ID')
    const channelId = request.headers.get('X-Goog-Channel-ID')
    const channelToken = request.headers.get('X-Goog-Channel-Token')
    const channelExpiration = request.headers.get('X-Goog-Channel-Expiration')
    
    logger.api('Drive webhook received', {
      resourceState,
      resourceId,
      channelId,
      hasToken: !!channelToken,
      expiration: channelExpiration
    })
    
    // Verify channel token (security check)
    const expectedToken = process.env.GOOGLE_WEBHOOK_TOKEN
    if (expectedToken && channelToken !== expectedToken) {
      logger.security('Invalid webhook token', {
        channelId,
        expected: !!expectedToken,
        received: !!channelToken
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Handle different resource states
    switch (resourceState) {
      case 'sync':
        // Initial sync notification
        logger.sync('Webhook sync notification received')
        break
        
      case 'change':
        // File changed!
        logger.sync('Drive file changed', { channelId, resourceId })
        
        // Trigger sync for all connected users
        // In a real app, you'd use a queue system or websockets
        // For now, we'll rely on the next auto-sync cycle to pick it up
        
        // TODO: Implement user notification system
        // - Store channel to user mapping
        // - Notify specific user via WebSocket/SSE
        // - Trigger immediate sync for that user
        
        break
        
      case 'not_exists':
        // File was deleted
        logger.sync('Drive file deleted', { channelId, resourceId })
        break
        
      case 'trash':
        // File was trashed
        logger.sync('Drive file trashed', { channelId, resourceId })
        break
        
      default:
        logger.warn('Unknown webhook resource state', { resourceState })
    }
    
    // Google expects a 200 response
    return NextResponse.json({ success: true })
    
  } catch (error) {
    logger.error('Webhook handling failed', {}, error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle sync pings
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
