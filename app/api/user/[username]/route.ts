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

    // Get force refresh from query params
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    const profile = await analyzeUser(username, forceRefresh)

    if (!profile) {
      const notFoundResponse = NextResponse.json({ error: 'User not found' }, { status: 404 })

      // Cache 404 responses for a short time to prevent repeated invalid requests
      notFoundResponse.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')

      return notFoundResponse
    }

    const response = NextResponse.json(profile)

    // Set aggressive caching headers for successful responses
    if (forceRefresh) {
      // If force refresh was requested, cache for shorter time
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600')
    } else {
      // Normal requests get longer cache time with stale-while-revalidate
      response.headers.set('Cache-Control', 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600')
    }

    // Add ETag for conditional requests
    const etag = `"${username}-${profile.score}-${Date.parse(profile.updatedAt.toString())}"`.replace(/\s/g, '')
    response.headers.set('ETag', etag)

    // Add Last-Modified header
    response.headers.set('Last-Modified', profile.updatedAt.toUTCString())

    // Add Vary header for different query parameters
    response.headers.set('Vary', 'Accept-Encoding')

    return response
  } catch (error) {
    console.error('Error fetching user profile:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }

      if (error.message.includes('GitHub authentication failed')) {
        return NextResponse.json(
          { error: 'GitHub authentication failed. Please check configuration.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}