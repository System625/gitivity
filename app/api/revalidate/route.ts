import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { logger } from "@/lib/logger"

/**
 * On-demand revalidation endpoint for immediate cache invalidation
 * This enables immediate leaderboard updates after user analysis
 */
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')
  const path = searchParams.get('path')
  const tag = searchParams.get('tag')

  // Security check
  const expectedSecret = process.env.REVALIDATE_SECRET || 'dev-secret'
  if (secret !== expectedSecret) {
    logger.warn('Unauthorized revalidation attempt', {
      providedSecret: secret ? '[REDACTED]' : 'none',
      path,
      tag
    })
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (!path && !tag) {
    return NextResponse.json({ 
      error: 'Either path or tag parameter is required' 
    }, { status: 400 })
  }

  try {
    if (path) {
      revalidatePath(path)
      logger.info('Path revalidated successfully', { 
        path,
        operation: 'on-demand-revalidation'
      })
    }

    if (tag) {
      revalidateTag(tag)
      logger.info('Tag revalidated successfully', { 
        tag,
        operation: 'on-demand-revalidation'
      })
    }

    return NextResponse.json({ 
      success: true,
      message: `Revalidated ${path ? `path: ${path}` : ''}${path && tag ? ' and ' : ''}${tag ? `tag: ${tag}` : ''}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Revalidation failed', {
      path,
      tag,
      error: error instanceof Error ? error.message : String(error)
    })

    return NextResponse.json({
      error: 'Revalidation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Also support GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request)
}