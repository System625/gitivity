import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Debug endpoint for leaderboard issues
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'profiles'

  try {
    switch (action) {
      case 'profiles':
        // Get all profiles in database
        const allProfiles = await prisma.gitivityProfile.findMany({
          orderBy: { score: 'desc' },
          select: {
            username: true,
            score: true,
            updatedAt: true,
            createdAt: true
          }
        })
        
        return NextResponse.json({
          success: true,
          count: allProfiles.length,
          data: allProfiles.map(p => ({
            ...p,
            updatedAt: p.updatedAt.toISOString(),
            createdAt: p.createdAt.toISOString()
          }))
        })

      case 'top10':
        // Get top 10 exactly like leaderboard page
        const topProfiles = await prisma.gitivityProfile.findMany({
          orderBy: { score: 'desc' },
          take: 10,
          select: {
            username: true,
            score: true,
            avatarUrl: true,
            stats: true,
            updatedAt: true
          }
        })
        
        return NextResponse.json({
          success: true,
          data: topProfiles.map(p => ({
            ...p,
            updatedAt: p.updatedAt.toISOString()
          }))
        })

      case 'force-revalidate':
        // Force revalidate the leaderboard
        revalidatePath('/leaderboard')
        return NextResponse.json({
          success: true,
          message: 'Leaderboard revalidated'
        })

      case 'check-user':
        const username = searchParams.get('username')
        if (!username) {
          return NextResponse.json({
            error: 'Username parameter required'
          }, { status: 400 })
        }

        const user = await prisma.gitivityProfile.findFirst({
          where: {
            username: username.toLowerCase()
          }
        })

        return NextResponse.json({
          success: true,
          found: !!user,
          data: user ? {
            username: user.username,
            score: user.score,
            updatedAt: user.updatedAt.toISOString(),
            createdAt: user.createdAt.toISOString()
          } : null
        })

      default:
        return NextResponse.json({
          error: 'Invalid action. Available: profiles, top10, force-revalidate, check-user'
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Database query failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}