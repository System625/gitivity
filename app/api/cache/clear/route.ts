import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'leaderboard':
        // Clear all leaderboard caches
        const leaderboardStats = cache.getStats().leaderboard
        cache.clearLeaderboard()
        return NextResponse.json({
          message: 'Leaderboard cache cleared',
          previousStats: leaderboardStats,
          newStats: cache.getStats().leaderboard
        })

      case 'all':
        // Clear all caches
        const allStats = cache.getStats()
        cache.clearAll()
        return NextResponse.json({
          message: 'All caches cleared',
          previousStats: allStats,
          newStats: cache.getStats()
        })

      default:
        return NextResponse.json({
          error: 'Invalid cache type. Use ?type=leaderboard or ?type=all'
        }, { status: 400 })
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return current cache stats
  const stats = cache.getStats()
  return NextResponse.json({ stats })
}