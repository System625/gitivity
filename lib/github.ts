import { trackError } from "@/lib/error-tracker"
import { recordRateLimit } from "@/lib/metrics"

export interface GitHubProfileData {
  username: string
  name: string | null
  avatarUrl: string
  bio: string | null
  followers: number
  following: number
  publicRepos: number
  totalStarsReceived: number // Stars received on user's repos
  totalForksReceived: number // Forks of user's repos
  totalCommits: number
  createdAt: string
  updatedAt: string
  languages: { name: string; percentage: number }[]
  // Enhanced data for Gitivity 2.0
  totalPRsOpened: number
  totalPRsMerged: number
  totalIssuesOpened: number
  totalIssuesClosed: number
  totalReviewsGiven: number
  repositoryHealth: { openIssues: number; closedIssues: number; ratio: number }
  contributionStreak: { current: number; longest: number }
  // Additional debug info
  rawRepoData?: Record<string, unknown>[]
  rawContributionsData?: Record<string, unknown>
}

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
        console.warn(`GitHub API attempt ${attempt} failed with status ${response.status}, retrying in ${backoffDelay}ms`)
        await sleep(backoffDelay)
        continue
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        console.warn(`GitHub API attempt ${attempt} failed with network error, retrying in ${backoffDelay}ms:`, error)
        await sleep(backoffDelay)
        continue
      }
    }
  }
  
  throw lastError!
}

function validateGitHubResponse(data: unknown): boolean {
  // Validate basic structure
  if (!data || typeof data !== 'object') return false
  const dataObj = data as Record<string, unknown>
  if (!dataObj.data || typeof dataObj.data !== 'object') return false
  const dataData = dataObj.data as Record<string, unknown>
  if (!dataData.user || typeof dataData.user !== 'object') return false
  
  const user = dataData.user as Record<string, unknown>
  
  // Validate required fields
  const requiredStringFields = ['login', 'avatarUrl', 'createdAt', 'updatedAt']
  for (const field of requiredStringFields) {
    if (typeof user[field] !== 'string') return false
  }
  
  // Validate nested objects with required structure
  const followers = user.followers as Record<string, unknown> | undefined
  const following = user.following as Record<string, unknown> | undefined
  const repositories = user.repositories as Record<string, unknown> | undefined
  const issues = user.issues as Record<string, unknown> | undefined
  const pullRequests = user.pullRequests as Record<string, unknown> | undefined
  const contributionsCollection = user.contributionsCollection as Record<string, unknown> | undefined

  if (!followers || typeof followers.totalCount !== 'number') return false
  if (!following || typeof following.totalCount !== 'number') return false
  if (!repositories || typeof repositories.totalCount !== 'number') return false
  if (!Array.isArray(repositories.nodes)) return false
  if (!issues || typeof issues.totalCount !== 'number') return false
  if (!pullRequests || typeof pullRequests.totalCount !== 'number') return false
  if (!contributionsCollection || typeof contributionsCollection !== 'object') return false
  
  // Validate contributionsCollection
  for (const field of ['totalCommitContributions', 'totalIssueContributions', 'totalPullRequestContributions', 'totalPullRequestReviewContributions']) {
    if (typeof contributionsCollection[field] !== 'number') return false
  }
  
  // Validate repositories structure
  for (const repo of repositories.nodes as unknown[]) {
    const repoObj = repo as Record<string, unknown>
    if (typeof repoObj !== 'object' || repoObj === null) return false
    if (typeof repoObj.stargazerCount !== 'number') return false
    if (typeof repoObj.forkCount !== 'number') return false
    if (typeof repoObj.isFork !== 'boolean') return false
    const repoIssues = repoObj.issues as Record<string, unknown> | undefined
    if (!repoIssues || typeof repoIssues.totalCount !== 'number') return false
  }
  
  return true
}

export async function getGithubProfileData(username: string): Promise<GitHubProfileData | null> {
  const token = process.env.GITHUB_PAT
  
  if (!token) {
    throw new Error('GITHUB_PAT environment variable is required')
  }

  const query = `
    query GetUserProfile($username: String!) {
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
        repositories(first: 100, privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
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
        issues {
          totalCount
        }
        pullRequests {
          totalCount
        }
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
        }
        createdAt
        updatedAt
      }
      rateLimit {
        remaining
        resetAt
      }
    }
  `

  try {
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

    // Check for HTTP-level errors
    if (!response.ok) {
      
      const error = response.status === 401 
        ? new Error('Invalid GitHub token. Please check GITHUB_PAT environment variable.')
        : response.status === 403
        ? (() => {
            const resetTime = response.headers.get('x-ratelimit-reset')
            const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null
            return new Error(`GitHub API rate limit exceeded. ${resetDate ? `Resets at ${resetDate.toISOString()}` : 'Try again later.'}`)
          })()
        : response.status >= 500
        ? new Error('GitHub API is temporarily unavailable. Please try again later.')
        : new Error(`GitHub API error: ${response.status} ${response.statusText}`)

      trackError(error, {
        operation: 'github-http-request',
        component: 'github-api',
        httpStatus: response.status,
        username
      })
      
      throw error
    }

    const data = await response.json()

    // Validate response structure before processing
    if (!validateGitHubResponse(data)) {
      const error = new Error('GitHub API returned invalid response format')
      trackError(error, {
        operation: 'github-response-validation',
        component: 'github-api',
        username
      })
      throw error
    }

    if (data.errors) {
      console.error('GitHub API GraphQL errors:', data.errors)
      
      // Check for rate limit errors in GraphQL response
      const rateLimitError = data.errors.find((error: { type?: string; message?: string }) => 
        error.type === 'RATE_LIMITED' || 
        error.message?.includes('rate limit') ||
        error.message?.includes('API rate limit')
      )
      
      if (rateLimitError) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.')
      }
      
      // Check for authentication errors
      const authError = data.errors.find((error: { type?: string; message?: string }) => 
        error.type === 'FORBIDDEN' || 
        error.message?.includes('Bad credentials')
      )
      
      if (authError) {
        throw new Error('GitHub authentication failed. Please check your token.')
      }
      
      throw new Error(`GitHub API error: ${data.errors[0].message}`)
    }

    if (!data.data?.user) {
      return null
    }

    // Record rate limit metrics
    if (data.data.rateLimit) {
      recordRateLimit(data.data.rateLimit.remaining, data.data.rateLimit.resetAt)
    }

    const user = data.data.user
    const repos = user.repositories.nodes

    // Only count stars/forks from original repos (not forks)
    const originalRepos = repos.filter((repo: Record<string, unknown>) => !repo.isFork)
    const totalStarsReceived = originalRepos.reduce((sum: number, repo: Record<string, unknown>) => {
      const stars = repo.stargazerCount as number
      return sum + (typeof stars === 'number' && stars >= 0 ? stars : 0)
    }, 0)
    const totalForksReceived = originalRepos.reduce((sum: number, repo: Record<string, unknown>) => {
      const forks = repo.forkCount as number
      return sum + (typeof forks === 'number' && forks >= 0 ? forks : 0)
    }, 0)

    // Get total commits from contributions collection
    const totalCommits = user.contributionsCollection.totalCommitContributions

    // Calculate enhanced metrics for Gitivity 2.0
    const totalPRsOpened = user.pullRequests.totalCount // Total PRs opened by user
    const totalPRsMerged = user.contributionsCollection.totalPullRequestContributions // PRs that were merged/contributed
    const totalIssuesOpened = user.issues.totalCount // Total issues opened by user
    const totalIssuesClosed = user.contributionsCollection.totalIssueContributions // Issues contributed/closed
    const totalReviewsGiven = user.contributionsCollection.totalPullRequestReviewContributions

    // Calculate repository health (for original repos only)
    const totalOpenIssues = originalRepos.reduce((sum: number, repo: Record<string, unknown>) => {
      const issues = repo.issues as Record<string, unknown> | undefined
      return sum + ((issues?.totalCount as number) || 0)
    }, 0)
    const totalClosedIssues = 0 // We can't easily get closed issues per repo
    const repositoryHealth = {
      openIssues: totalOpenIssues,
      closedIssues: totalClosedIssues,
      ratio: totalOpenIssues === 0 ? 1.0 : 0.0 // If no open issues, 100% healthy; otherwise 0% since we can't track closed
    }

    // Calculate contribution streak (simplified - would need contribution calendar for exact calculation)
    const accountAgeYears = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
    const avgCommitsPerYear = totalCommits / Math.max(accountAgeYears, 1)
    const contributionStreak = {
      current: Math.floor(avgCommitsPerYear / 10), // Rough estimate
      longest: Math.floor(avgCommitsPerYear / 8) // Rough estimate
    }

    // Calculate language distribution
    const languageCounts: { [key: string]: number } = {}
    let totalReposWithLanguages = 0

    repos.forEach((repo: Record<string, unknown>) => {
      const primaryLanguage = repo.primaryLanguage as Record<string, unknown> | undefined
      if (primaryLanguage) {
        const languageName = primaryLanguage.name as string
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
      username: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      publicRepos: user.repositories.totalCount,
      totalStarsReceived,
      totalForksReceived,
      totalCommits,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      languages,
      // Enhanced data for Gitivity 2.0
      totalPRsOpened,
      totalPRsMerged,
      totalIssuesOpened,
      totalIssuesClosed,
      totalReviewsGiven,
      repositoryHealth,
      contributionStreak,
      rawRepoData: repos,
      rawContributionsData: user.contributionsCollection
    }

  } catch (error) {
    // Logging will be handled by the calling function (analysis.ts)
    // Re-throw to preserve error handling flow
    throw error
  }
}