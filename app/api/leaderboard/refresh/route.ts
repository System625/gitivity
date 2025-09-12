import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { logger } from "@/lib/logger"

/**
 * Force refresh the leaderboard cache
 * This is a public endpoint for manual refreshing
 */
export async function POST() {
  try {
    // Force revalidate the leaderboard
    revalidatePath('/leaderboard')
    
    logger.info('Leaderboard cache manually refreshed', {
      operation: 'manual-refresh',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Leaderboard refreshed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to refresh leaderboard', {}, error as Error)
    
    return NextResponse.json({
      error: 'Failed to refresh leaderboard',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Support GET for easier browser testing
export async function GET() {
  return POST()
}