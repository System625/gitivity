import { NextRequest, NextResponse } from 'next/server'
import { analyzeUser } from '@/lib/analysis'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Force refresh by passing forceRefresh: true
    const profile = await analyzeUser(username, true)

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to analyze user or user not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      profile: {
        username: profile.username,
        score: profile.score,
        updatedAt: profile.updatedAt,
        rank: profile.rank,
        totalUsers: profile.totalUsers
      }
    })
  } catch (error) {
    console.error('Error refreshing user profile:', error)
    
    if (error instanceof Error) {
      // Handle specific GitHub API errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'GitHub authentication failed. Please contact support.' },
          { status: 503 }
        )
      }
      
      if (error.message.includes('temporarily unavailable')) {
        return NextResponse.json(
          { error: 'GitHub API is temporarily unavailable. Please try again later.' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}