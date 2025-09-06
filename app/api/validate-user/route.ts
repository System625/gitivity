import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    // Simple GitHub API check to see if user exists
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'User-Agent': 'Gitivity-App',
        ...(process.env.GITHUB_PAT && {
          'Authorization': `token ${process.env.GITHUB_PAT}`
        })
      }
    })

    if (response.status === 404) {
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'GitHub API error' }, { status: 500 })
    }

    return NextResponse.json({ exists: true }, { status: 200 })
  } catch (error) {
    console.error('Error validating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}