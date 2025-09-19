import { trackError } from "@/lib/error-tracker"
import { recordRateLimit } from "@/lib/metrics"
import { type GitHubProfileData } from "@/lib/github"

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      // Don't retry on client errors (4xx) except for rate limits
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response
      }

      // Don't retry on successful responses
      if (response.ok) {
        return response
      }

      // For server errors (5xx) or rate limits (429), retry with exponential backoff
      if (attempt < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        // Retry after backoff delay
        await sleep(backoffDelay)
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        // Retry after backoff delay
        await sleep(backoffDelay)
        continue
      }
    }
  }

  throw lastError!
}

interface BasicUserData {
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  followers: { totalCount: number }
  following: { totalCount: number }
  createdAt: string
  updatedAt: string
}

interface ContributionsData {
  contributionsCollection: {
    totalCommitContributions: number
    totalIssueContributions: number
    totalPullRequestContributions: number
    totalPullRequestReviewContributions: number
  }
}

interface RepositoryData {
  repositories: {
    totalCount: number
    nodes: Array<{
      name: string
      stargazerCount: number
      forkCount: number
      primaryLanguage: { name: string } | null
      isFork: boolean
      isPrivate: boolean
      issues: { totalCount: number }
      pullRequests: { totalCount: number }
    }>
  }
}

interface IssuesAndPRsData {
  issues: { totalCount: number }
  pullRequests: { totalCount: number }
}

interface RateLimitData {
  rateLimit: {
    remaining: number
    resetAt: string
  }
}

/**
 * Fetch basic user profile information (fastest query)
 */
async function fetchBasicUserData(username: string, token: string): Promise<BasicUserData> {
  const query = `
    query GetBasicUserData($username: String!) {
      user(login: $username) {
        login
        name
        avatarUrl
        bio
        followers {
          totalCount
        }
        following {
          totalCount
        }
        createdAt
        updatedAt
      }
    }
  `

  const response = await fetchWithRetry(GITHUB_GRAPHQL_URL, {
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
    throw new Error(`Basic user data fetch failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors in basic user data: ${JSON.stringify(data.errors)}`)
  }

  if (!data.data?.user) {
    throw new Error('User not found')
  }

  return data.data.user
}

/**
 * Fetch contributions data
 */
async function fetchContributionsData(username: string, token: string): Promise<ContributionsData> {
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

  const response = await fetchWithRetry(GITHUB_GRAPHQL_URL, {
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
    throw new Error(`Contributions data fetch failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors in contributions data: ${JSON.stringify(data.errors)}`)
  }

  return data.data.user
}

/**
 * Fetch repositories data (most expensive query, split into smaller chunks)
 */
async function fetchRepositoriesData(username: string, token: string): Promise<RepositoryData> {
  const query = `
    query GetRepositoriesData($username: String!) {
      user(login: $username) {
        repositories(first: 50, privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
          totalCount
          nodes {
            name
            stargazerCount
            forkCount
            primaryLanguage {
              name
            }
            isFork
            isPrivate
            issues {
              totalCount
            }
            pullRequests {
              totalCount
            }
          }
        }
      }
    }
  `

  const response = await fetchWithRetry(GITHUB_GRAPHQL_URL, {
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
    throw new Error(`Repositories data fetch failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors in repositories data: ${JSON.stringify(data.errors)}`)
  }

  return data.data.user
}

/**
 * Fetch issues and PRs count
 */
async function fetchIssuesAndPRsData(username: string, token: string): Promise<IssuesAndPRsData> {
  const query = `
    query GetIssuesAndPRsData($username: String!) {
      user(login: $username) {
        issues {
          totalCount
        }
        pullRequests {
          totalCount
        }
      }
    }
  `

  const response = await fetchWithRetry(GITHUB_GRAPHQL_URL, {
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
    throw new Error(`Issues and PRs data fetch failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors in issues and PRs data: ${JSON.stringify(data.errors)}`)
  }

  return data.data.user
}

/**
 * Fetch rate limit information
 */
async function fetchRateLimitData(token: string): Promise<RateLimitData> {
  const query = `
    query GetRateLimit {
      rateLimit {
        remaining
        resetAt
      }
    }
  `

  const response = await fetchWithRetry(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  })

  if (!response.ok) {
    throw new Error(`Rate limit data fetch failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL errors in rate limit data: ${JSON.stringify(data.errors)}`)
  }

  return data.data
}

/**
 * Optimized GitHub profile data fetching with parallel requests
 * Splits the monolithic query into 4 smaller, parallel requests for better performance
 */
export async function getGithubProfileDataParallel(username: string): Promise<GitHubProfileData | null> {
  const token = process.env.GITHUB_PAT

  if (!token) {
    throw new Error('GITHUB_PAT environment variable is required')
  }

  try {
    // Execute all requests in parallel for maximum performance
    const [
      basicUserData,
      contributionsData,
      repositoriesData,
      issuesAndPRsData,
      rateLimitData
    ] = await Promise.allSettled([
      fetchBasicUserData(username, token),
      fetchContributionsData(username, token),
      fetchRepositoriesData(username, token),
      fetchIssuesAndPRsData(username, token),
      fetchRateLimitData(token)
    ])

    // Check if basic user data failed (user doesn't exist)
    if (basicUserData.status === 'rejected') {
      if (basicUserData.reason.message.includes('User not found')) {
        return null
      }
      throw basicUserData.reason
    }

    const userData = basicUserData.value

    // Handle partial failures gracefully - use defaults if some requests fail
    const contributions = contributionsData.status === 'fulfilled'
      ? contributionsData.value.contributionsCollection
      : {
          totalCommitContributions: 0,
          totalIssueContributions: 0,
          totalPullRequestContributions: 0,
          totalPullRequestReviewContributions: 0
        }

    const repositories = repositoriesData.status === 'fulfilled'
      ? repositoriesData.value.repositories
      : { totalCount: 0, nodes: [] }

    const issuesAndPRs = issuesAndPRsData.status === 'fulfilled'
      ? issuesAndPRsData.value
      : { issues: { totalCount: 0 }, pullRequests: { totalCount: 0 } }

    // Record rate limit if available
    if (rateLimitData.status === 'fulfilled') {
      recordRateLimit(rateLimitData.value.rateLimit.remaining, rateLimitData.value.rateLimit.resetAt)
    }

    // Log any partial failures
    const failures = [contributionsData, repositoriesData, issuesAndPRsData, rateLimitData]
      .filter(result => result.status === 'rejected')

    if (failures.length > 0) {
      // Some requests failed but we have partial data
      console.log('Partial failures:',
        failures.map(f => f.status === 'rejected' ? f.reason.message : '').join(', ')
      )
    }

    const repos = repositories.nodes

    // Calculate aggregated data (same logic as original implementation)
    const originalRepos = repos.filter(repo => !repo.isFork)
    const totalStarsReceived = originalRepos.reduce((sum, repo) => {
      const stars = repo.stargazerCount
      return sum + (typeof stars === 'number' && stars >= 0 ? stars : 0)
    }, 0)
    const totalForksReceived = originalRepos.reduce((sum, repo) => {
      const forks = repo.forkCount
      return sum + (typeof forks === 'number' && forks >= 0 ? forks : 0)
    }, 0)

    const totalCommits = contributions.totalCommitContributions
    const totalPRsOpened = issuesAndPRs.pullRequests.totalCount
    const totalPRsMerged = contributions.totalPullRequestContributions
    const totalIssuesOpened = issuesAndPRs.issues.totalCount
    const totalIssuesClosed = contributions.totalIssueContributions
    const totalReviewsGiven = contributions.totalPullRequestReviewContributions

    // Calculate repository health
    const totalOpenIssues = originalRepos.reduce((sum, repo) => {
      return sum + (repo.issues?.totalCount || 0)
    }, 0)
    const repositoryHealth = {
      openIssues: totalOpenIssues,
      closedIssues: 0,
      ratio: totalOpenIssues === 0 ? 1.0 : 0.0
    }

    // Calculate contribution streak (simplified)
    const accountAgeYears = (Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
    const avgCommitsPerYear = totalCommits / Math.max(accountAgeYears, 1)
    const contributionStreak = {
      current: Math.floor(avgCommitsPerYear / 10),
      longest: Math.floor(avgCommitsPerYear / 8)
    }

    // Calculate language distribution
    const languageCounts: { [key: string]: number } = {}
    let totalReposWithLanguages = 0

    repos.forEach(repo => {
      if (repo.primaryLanguage) {
        const languageName = repo.primaryLanguage.name
        languageCounts[languageName] = (languageCounts[languageName] || 0) + 1
        totalReposWithLanguages++
      }
    })

    const languages = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalReposWithLanguages) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5) // Top 5 languages

    return {
      username: userData.login,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
      bio: userData.bio,
      followers: userData.followers.totalCount,
      following: userData.following.totalCount,
      publicRepos: repositories.totalCount,
      totalStarsReceived,
      totalForksReceived,
      totalCommits,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      languages,
      totalPRsOpened,
      totalPRsMerged,
      totalIssuesOpened,
      totalIssuesClosed,
      totalReviewsGiven,
      repositoryHealth,
      contributionStreak,
      rawRepoData: repos,
      rawContributionsData: contributions
    }

  } catch (error) {
    // Track the error for monitoring
    trackError(error as Error, {
      operation: 'github-parallel-fetch',
      component: 'github-api',
      username
    })

    throw error
  }
}