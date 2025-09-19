import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'

interface ProgressiveData {
  step: 'basic' | 'contributions' | 'repositories' | 'issues' | 'complete' | 'error'
  progress: number
  data: Record<string, unknown>
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  // Check if we have complete cached data
  const cachedProfile = cache.getProfile(username)
  if (cachedProfile) {
    return NextResponse.json({
      step: 'complete',
      progress: 100,
      data: cachedProfile
    } as ProgressiveData)
  }

  // Check for partial GitHub data in cache
  const cachedGithubData = cache.getGithubData(username)
  if (cachedGithubData) {
    return NextResponse.json({
      step: 'repositories',
      progress: 80,
      data: {
        github_data: cachedGithubData,
        message: 'GitHub data loaded, calculating scores...'
      }
    } as ProgressiveData)
  }

  // Return initial state - client should start fetching
  return NextResponse.json({
    step: 'basic',
    progress: 0,
    data: {
      username,
      message: 'Starting GitHub profile analysis...'
    }
  } as ProgressiveData)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const body = await request.json()
    const { step } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const token = process.env.GITHUB_PAT
    if (!token) {
      return NextResponse.json({ error: 'GitHub API not configured' }, { status: 500 })
    }

    // Handle different progressive loading steps
    switch (step) {
      case 'basic':
        return await fetchBasicData(username, token)
      case 'contributions':
        return await fetchContributionsData(username, token)
      case 'repositories':
        return await fetchRepositoriesData(username, token)
      case 'complete':
        return await fetchCompleteAnalysis()
      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        step: 'error',
        progress: 0,
        data: {}
      } as ProgressiveData,
      { status: 500 }
    )
  }
}

async function fetchBasicData(username: string, token: string): Promise<NextResponse> {
  const query = `
    query GetBasicUserData($username: String!) {
      user(login: $username) {
        login
        name
        avatarUrl
        bio
        followers { totalCount }
        following { totalCount }
        createdAt
        updatedAt
      }
    }
  `

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { username }
    })
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  if (!data.data?.user) {
    return NextResponse.json({
      step: 'error',
      progress: 0,
      error: 'User not found',
      data: {}
    } as ProgressiveData, { status: 404 })
  }

  return NextResponse.json({
    step: 'basic',
    progress: 25,
    data: {
      basic_info: data.data.user,
      message: 'Basic profile loaded, fetching contributions...'
    }
  } as ProgressiveData)
}

async function fetchContributionsData(username: string, token: string): Promise<NextResponse> {
  const query = `
    query GetContributionsData($username: String!) {
      user(login: $username) {
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
        }
      }
    }
  `

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { username }
    })
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  return NextResponse.json({
    step: 'contributions',
    progress: 50,
    data: {
      contributions: data.data.user.contributionsCollection,
      message: 'Contributions loaded, fetching repositories...'
    }
  } as ProgressiveData)
}

async function fetchRepositoriesData(username: string, token: string): Promise<NextResponse> {
  const query = `
    query GetRepositoriesData($username: String!) {
      user(login: $username) {
        repositories(first: 50, privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            name
            stargazerCount
            forkCount
            primaryLanguage { name }
            isFork
            isPrivate
            issues { totalCount }
            pullRequests { totalCount }
          }
        }
        issues { totalCount }
        pullRequests { totalCount }
      }
    }
  `

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { username }
    })
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  return NextResponse.json({
    step: 'repositories',
    progress: 75,
    data: {
      repositories: data.data.user.repositories,
      issues: data.data.user.issues,
      pullRequests: data.data.user.pullRequests,
      message: 'Repositories loaded, calculating final score...'
    }
  } as ProgressiveData)
}

async function fetchCompleteAnalysis(): Promise<NextResponse> {
  // This would trigger the full analysis pipeline
  // For now, return a placeholder
  return NextResponse.json({
    step: 'complete',
    progress: 100,
    data: {
      message: 'Analysis complete! Redirecting to profile...'
    }
  } as ProgressiveData)
}