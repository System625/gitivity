import { NextResponse } from "next/server"
import { metrics } from "@/lib/metrics"

/**
 * Debug endpoint to view performance metrics and system health
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
  const action = searchParams.get('action') || 'health'

  try {
    switch (action) {
      case 'health':
        const health = metrics.getSystemHealth()
        return NextResponse.json({
          success: true,
          data: health
        })

      case 'operations':
        const operationName = searchParams.get('operation')
        const operations = metrics.getOperationMetrics(operationName || undefined)
        return NextResponse.json({
          success: true,
          data: operations
        })

      case 'slow':
        const slowLimit = parseInt(searchParams.get('limit') || '10')
        const slowOps = metrics.getSlowestOperations(slowLimit)
        return NextResponse.json({
          success: true,
          data: slowOps
        })

      case 'errors':
        const errorLimit = parseInt(searchParams.get('limit') || '10')
        const errorOps = metrics.getHighErrorOperations(errorLimit)
        return NextResponse.json({
          success: true,
          data: errorOps
        })

      case 'export':
        const allMetrics = metrics.exportMetrics()
        return NextResponse.json({
          success: true,
          data: allMetrics
        })

      case 'reset':
        if (process.env.NODE_ENV !== 'development') {
          return NextResponse.json({
            error: 'Reset only available in development'
          }, { status: 400 })
        }
        metrics.reset()
        return NextResponse.json({
          success: true,
          message: 'Metrics reset successfully'
        })

      default:
        return NextResponse.json({
          error: 'Invalid action. Available: health, operations, slow, errors, export, reset'
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to retrieve metrics data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}