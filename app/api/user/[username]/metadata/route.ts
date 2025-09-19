import { NextRequest, NextResponse } from 'next/server'
import { analyzeUser } from '@/lib/analysis'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Try to get cached profile first, don't force refresh for metadata
    const profile = await analyzeUser(username, false)

    if (!profile) {
      return NextResponse.json({
        title: `${username} - User Not Found - Gitivity`,
        description: `GitHub user "${username}" could not be found.`,
        ogImage: null
      })
    }

    const ogImageUrl = `/api/og?username=${profile.username}&score=${profile.score}&avatar=${encodeURIComponent(profile.avatarUrl || '')}`

    return NextResponse.json({
      title: `${profile.username} - Gitivity Score: ${profile.score}%`,
      description: `Check out ${profile.username}'s GitHub activity analysis and Gitivity Score of ${profile.score}%`,
      ogImage: ogImageUrl,
      score: profile.score
    })
  } catch (error) {
    console.error('Error fetching metadata:', error)
    const { username } = await params

    // Return fallback metadata on error
    return NextResponse.json({
      title: `${username} - Gitivity Profile`,
      description: `Analyzing ${username}'s GitHub profile...`,
      ogImage: null
    })
  }
}