import { NextResponse } from "next/server"
import { errorTracker } from "@/lib/error-tracker"

/**
 * Debug endpoint to view error statistics and reports
 * Only available in development or with proper authentication
 */
export async function GET(request: Request) {
  // Basic security check - only in development or with debug header
  if (process.env.NODE_ENV === 'production') {
    const debugHeader = request.headers.get('x-debug-key')
    if (debugHeader !== process.env.DEBUG_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'stats'

  try {
    switch (action) {
      case 'stats':
        const stats = errorTracker.getStats()
        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'top':
        const limit = parseInt(searchParams.get('limit') || '10')
        const topErrors = errorTracker.getTopErrors(limit)
        return NextResponse.json({
          success: true,
          data: topErrors
        })

      case 'recent':
        const hours = parseInt(searchParams.get('hours') || '1')
        const recentErrors = errorTracker.getRecentErrors(hours)
        return NextResponse.json({
          success: true,
          data: recentErrors
        })

      case 'export':
        const allErrors = errorTracker.exportErrors()
        return NextResponse.json({
          success: true,
          data: allErrors
        })

      case 'cleanup':
        const cleanupHours = parseInt(searchParams.get('hours') || '24')
        errorTracker.cleanup(cleanupHours)
        return NextResponse.json({
          success: true,
          message: `Cleaned up errors older than ${cleanupHours} hours`
        })

      default:
        return NextResponse.json({
          error: 'Invalid action. Available: stats, top, recent, export, cleanup'
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to retrieve error data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}