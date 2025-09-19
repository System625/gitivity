import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, type } = body

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }

    let invalidated = 0

    switch (type) {
      case 'user':
        if (!username) {
          return NextResponse.json({ error: 'Username is required for user invalidation' }, { status: 400 })
        }
        cache.invalidateUser(username)
        invalidated = 1
        break

      case 'leaderboard':
        // Clear all leaderboard caches
        const stats = cache.getStats()
        cache.clearLeaderboard()
        invalidated = stats.leaderboard.size
        break

      case 'all':
        // Clear all caches
        const allStats = cache.getStats()
        cache.clearAll()
        invalidated = allStats.global.size + allStats.profiles.size + allStats.leaderboard.size
        break

      default:
        return NextResponse.json({ error: 'Invalid type. Use: user, leaderboard, or all' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Invalidated ${invalidated} cache entries`,
      type,
      username: username || null
    })

  } catch (error) {
    console.error('Cache invalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    )
  }
}

// GET endpoint to view cache stats
export async function GET() {
  try {
    const stats = cache.getStats()

    return NextResponse.json({
      cache_stats: stats,
      cleanup_info: {
        last_cleanup: new Date().toISOString(),
        expired_entries_cleaned: cache.cleanup()
      }
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    )
  }
}