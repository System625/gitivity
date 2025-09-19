import { prisma } from "@/lib/prisma"
import { getGithubProfileData, type GitHubProfileData } from "@/lib/github"
import { getGithubProfileDataParallel } from "@/lib/github-parallel"
import { calculateAchievements, type Achievement } from "@/lib/scoring/achievements"
import { calculateMultipliers } from "@/lib/scoring/multipliers"
import { calculateCreatorScore, calculateCollaboratorScore, calculateCraftsmanshipScore } from "@/lib/scoring/pillars"
import { logger, createUserLogger } from "@/lib/logger"
import { trackError, withErrorContext } from "@/lib/error-tracker"
import { metrics } from "@/lib/metrics"
import { cache } from "@/lib/cache"

interface GitivityScoreBreakdown {
  total: number
  creatorScore: number
  collaboratorScore: number
  craftsmanshipScore: number
  achievements: Achievement[]
  multipliers: { name: string; value: number }[]
}

interface GitivityStats {
  // Basic stats
  followers: number
  following: number
  publicRepos: number
  totalStarsReceived: number
  totalForksReceived: number
  totalCommits: number
  languages: { name: string; percentage: number }[]
  bio: string | null
  name: string | null
  createdAt: string
  lastUpdated: string
  
  // Enhanced Gitivity 2.0 stats
  totalPRsOpened: number
  totalPRsMerged: number
  totalIssuesOpened: number
  totalIssuesClosed: number
  totalReviewsGiven: number
  repositoryHealth: { openIssues: number; closedIssues: number; ratio: number }
  contributionStreak: { current: number; longest: number }
  
  // Score breakdown
  scoreBreakdown: {
    total: number
    creatorScore: number
    collaboratorScore: number
    craftsmanshipScore: number
    achievements: Achievement[]
    multipliers: { name: string; value: number }[]
  }
  
  // Calculated ratios
  finisherRatio: number
  
  rawRepoData?: Record<string, unknown>[]
  rawContributionsData?: Record<string, unknown>
}

interface GitivityProfile {
  id: string
  username: string
  score: number
  stats: GitivityStats
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
  rank?: number
  totalUsers?: number
}

async function getUserRank(userScore: number, username: string): Promise<{ rank: number; totalUsers: number }> {
  return await metrics.time('calculate-user-rank', async () => {
    try {
      // Check cache first for rank, but always get fresh totalUsers count
      const cached = cache.getUserRank(username, userScore)

      if (cached) {
        // Get fresh totalUsers count to avoid stale data
        const freshTotalUsers = await prisma.gitivityProfile.count()
        metrics.recordMetric('cache_hit', 1, 'count', { type: 'user_rank', username })
        return {
          rank: cached.rank,
          totalUsers: freshTotalUsers
        }
      }

      // Use a single optimized query to get both rank and total count
      // This leverages the new score index for much better performance
      const result = await metrics.time('database-query', async () => {
        return await prisma.$queryRaw<{ rank: bigint; total_users: bigint }[]>`
          WITH user_rank AS (
            SELECT
              ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
              username,
              score
            FROM gitivity_profiles
          ),
          total_count AS (
            SELECT COUNT(*) as total_users FROM gitivity_profiles
          )
          SELECT
            COALESCE(ur.rank, 0) as rank,
            tc.total_users
          FROM total_count tc
          LEFT JOIN user_rank ur ON ur.score = ${userScore}
          LIMIT 1
        `
      }, { operation: 'optimized-rank-calculation' })

      if (!result || result.length === 0) {
        return { rank: 0, totalUsers: 0 }
      }

      const { rank, total_users } = result[0]

      const rankData = {
        rank: Number(rank) || 0,
        totalUsers: Number(total_users) || 0
      }

      // Cache the result for 5 minutes
      cache.setUserRank(username, userScore, rankData, 300)
      metrics.recordMetric('cache_miss', 1, 'count', { type: 'user_rank', username })

      return rankData
    } catch (error) {
      logger.error('Error calculating user rank', { username }, error as Error)

      // Fallback to old method if optimized query fails
      try {
        const [higherScoreCount, totalUsers] = await Promise.all([
          prisma.gitivityProfile.count({
            where: { score: { gt: userScore } }
          }),
          prisma.gitivityProfile.count()
        ])

        const fallbackData = { rank: higherScoreCount + 1, totalUsers }

        // Cache fallback result for shorter time
        cache.setUserRank(username, userScore, fallbackData, 60)

        return fallbackData
      } catch (fallbackError) {
        logger.error('Fallback rank calculation also failed', { username }, fallbackError as Error)
        return { rank: 0, totalUsers: 0 }
      }
    }
  }, { username })
}

/**
 * Calculates the comprehensive Gitivity score using a multi-dimensional system.
 * Combines three pillars (Creator, Collaborator, Craftsmanship) with achievements and multipliers.
 * 
 * @param data - Complete GitHub profile data for scoring calculation
 * @returns GitivityScoreBreakdown with total score and component breakdown
 * 
 * @example
 * // High-performing developer
 * const breakdown = calculateGitivityScore(data)
 * // Returns: { 
 * //   total: 142, creatorScore: 87, collaboratorScore: 76, 
 * //   craftsmanshipScore: 82, achievements: [...], multipliers: [...] 
 * // }
 * 
 * Scoring System:
 * 1. Calculate three pillar scores (0-100 each)
 * 2. Average them to get base score (0-100) 
 * 3. Award achievements based on exceptional metrics
 * 4. Apply multipliers from achievements (can exceed 100%)
 * 5. No upper cap - elite developers can score above 100%
 */
function calculateGitivityScore(data: GitHubProfileData): GitivityScoreBreakdown {
  // 1. CREATOR SCORE - Impact of personal projects (0-100)
  const creatorScore = calculateCreatorScore(data)

  // 2. COLLABORATOR SCORE - Impact on broader ecosystem (0-100)
  const collaboratorScore = calculateCollaboratorScore(data)

  // 3. CRAFTSMANSHIP SCORE - Quality and consistency (0-100)
  const craftsmanshipScore = calculateCraftsmanshipScore(data)

  // 4. ACHIEVEMENTS & MULTIPLIERS
  const achievements = calculateAchievements(data)
  const multipliers = calculateMultipliers(data, achievements)

  // Calculate base score as average of the three pillars (0-100)
  let baseScore = (creatorScore + collaboratorScore + craftsmanshipScore) / 3
  
  // Cap base score at 100%
  baseScore = Math.min(baseScore, 100)

  // Apply achievement multipliers to potentially push above 100%
  let totalScore = baseScore
  multipliers.forEach(multiplier => {
    totalScore *= multiplier.value
  })

  // No cap on total score - elite developers can exceed 100%

  return {
    total: Math.round(totalScore),
    creatorScore: Math.round(creatorScore),
    collaboratorScore: Math.round(collaboratorScore),
    craftsmanshipScore: Math.round(craftsmanshipScore),
    achievements,
    multipliers
  }
}


// Request deduplication cache to prevent concurrent requests for the same user
const pendingRequests = new Map<string, Promise<GitivityProfile | null>>()

export type { Achievement, GitivityScoreBreakdown, GitivityStats, GitivityProfile }

export async function analyzeUser(username: string, forceRefresh: boolean = false): Promise<GitivityProfile | null> {
  const cacheKey = username.toLowerCase()
  
  return await withErrorContext('analyze-user', async () => {
    try {
      // Step 0: Check for pending request for the same user
      if (!forceRefresh && pendingRequests.has(cacheKey)) {
        logger.debug(`Deduplicating request for user: ${username}`)
        return await pendingRequests.get(cacheKey)!
      }

      // Create the analysis promise
      const analysisPromise = performAnalysis(username, forceRefresh)
      
      // Store the promise to deduplicate concurrent requests
      pendingRequests.set(cacheKey, analysisPromise)
      
      try {
        const result = await analysisPromise
        return result
      } finally {
        // Clean up the pending request when done
        pendingRequests.delete(cacheKey)
      }
    } catch (error) {
      // Clean up on error too
      pendingRequests.delete(cacheKey)
      throw error
    }
  }, {
    username,
    component: 'analysis',
    forceRefresh
  })
}

async function performAnalysis(username: string, forceRefresh: boolean = false): Promise<GitivityProfile | null> {
  const userLogger = createUserLogger(username)
  
  return await userLogger.timeAsync('user-analysis', async () => {
    try {
      // Step 1: Check Memory Cache First (fastest)
      if (!forceRefresh) {
        const memCached = cache.getProfile<GitivityProfile>(username)
        if (memCached) {
          userLogger.info('Using memory cached profile', {
            username,
            score: memCached.score
          })
          metrics.recordMetric('cache_hit', 1, 'count', { type: 'profile_memory', username })

          // Still get rank (which is also cached)
          const { rank, totalUsers } = await getUserRank(memCached.score, username)
          return {
            ...memCached,
            rank,
            totalUsers
          }
        }
      }

      // Step 2: Check Database Cache (if not force refresh)
      if (!forceRefresh) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const cachedProfile = await metrics.time('database-query', async () => {
          return await prisma.gitivityProfile.findFirst({
            where: {
              username: username.toLowerCase(),
              updatedAt: {
                gte: twentyFourHoursAgo
              }
            }
          })
        }, { operation: 'find-cached-profile', username })

        if (cachedProfile) {
          userLogger.info('Using database cached profile', {
            cacheAge: Date.now() - cachedProfile.updatedAt.getTime(),
            score: cachedProfile.score
          })
          metrics.recordMetric('cache_hit', 1, 'count', { type: 'profile_db', username })

          const profileData = {
            ...cachedProfile,
            stats: cachedProfile.stats as unknown as GitivityStats,
          } as GitivityProfile

          // Cache in memory for faster subsequent access
          cache.setProfile(username, profileData, 1800) // 30 minutes

          const { rank, totalUsers } = await getUserRank(cachedProfile.score, cachedProfile.username)
          return {
            ...profileData,
            rank,
            totalUsers
          }
        }
      }

    // Step 3: Fetch Live Data
    let githubData: GitHubProfileData | null = null
    try {
      userLogger.debug('Fetching live GitHub data')

      // Check GitHub data cache first (10 minute cache for GitHub API data)
      githubData = cache.getGithubData<GitHubProfileData>(username)

      if (githubData && !forceRefresh) {
        userLogger.info('Using cached GitHub data', {
          repos: githubData.publicRepos,
          stars: githubData.totalStarsReceived,
          commits: githubData.totalCommits
        })
        metrics.recordMetric('cache_hit', 1, 'count', { type: 'github_data', username })
      } else {
        // Fetch fresh data from GitHub using parallel requests for better performance
        githubData = await metrics.time('github-api-fetch', async () => {
          try {
            // Try parallel implementation first (faster)
            return await getGithubProfileDataParallel(username)
          } catch (parallelError) {
            userLogger.warn('Parallel GitHub fetch failed, falling back to monolithic query', {
              error: parallelError instanceof Error ? parallelError.message : String(parallelError)
            })

            // Fallback to original implementation
            return await getGithubProfileData(username)
          }
        }, { username })

        userLogger.info('Successfully fetched fresh GitHub data', {
          repos: githubData?.publicRepos,
          stars: githubData?.totalStarsReceived,
          commits: githubData?.totalCommits,
          method: 'parallel'
        })

        if (githubData) {
          // Cache GitHub data for 10 minutes
          cache.setGithubData(username, githubData, 600)
          metrics.recordMetric('cache_miss', 1, 'count', { type: 'github_data', username })
        }
      }

      // Record GitHub data metrics
      if (githubData) {
        metrics.recordMetric('github_profile_repos', githubData.publicRepos, 'count', { username })
        metrics.recordMetric('github_profile_stars', githubData.totalStarsReceived, 'count', { username })
        metrics.recordMetric('github_profile_commits', githubData.totalCommits, 'count', { username })
      }
    } catch (error) {
      userLogger.error('GitHub API error', { error: error instanceof Error ? error.message : String(error) }, error as Error)
      trackError(error as Error, {
        username,
        operation: 'github-api-fetch',
        component: 'analysis'
      })
      // If we have cached data and the error is rate limiting, return cached data
      if (error instanceof Error && error.message.includes('rate limit')) {
        const cachedProfile = await prisma.gitivityProfile.findFirst({
          where: {
            username: username.toLowerCase()
          },
          orderBy: {
            updatedAt: 'desc'
          }
        })
        
        if (cachedProfile) {
          userLogger.warn('Falling back to cached data due to rate limiting', {
            cacheAge: Date.now() - cachedProfile.updatedAt.getTime()
          })
          const { rank, totalUsers } = await getUserRank(cachedProfile.score, cachedProfile.username)
          return {
            ...cachedProfile,
            stats: cachedProfile.stats as unknown as GitivityStats,
            rank,
            totalUsers
          }
        }
      }
      throw error // Re-throw if we can't recover
    }
    
    if (!githubData) {
      userLogger.error('Failed to fetch GitHub data - user may not exist')
      return null
    }

    // Step 3: Calculate Score with new multi-dimensional system
    userLogger.debug('Calculating Gitivity score')
    const scoreBreakdown = await metrics.time('calculate-score', async () => {
      return calculateGitivityScore(githubData)
    }, { username })
    
    userLogger.info('Score calculated', {
      totalScore: scoreBreakdown.total,
      creatorScore: scoreBreakdown.creatorScore,
      collaboratorScore: scoreBreakdown.collaboratorScore,
      craftsmanshipScore: scoreBreakdown.craftsmanshipScore,
      achievementCount: scoreBreakdown.achievements.length,
      multiplierCount: scoreBreakdown.multipliers.length
    })

    // Record scoring metrics
    metrics.recordMetric('gitivity_score_total', scoreBreakdown.total, 'points', { username })
    metrics.recordMetric('gitivity_score_creator', scoreBreakdown.creatorScore, 'points', { username })
    metrics.recordMetric('gitivity_score_collaborator', scoreBreakdown.collaboratorScore, 'points', { username })
    metrics.recordMetric('gitivity_score_craftsmanship', scoreBreakdown.craftsmanshipScore, 'points', { username })

    // Prepare enhanced stats object
    const stats: GitivityStats = {
      // Basic stats
      followers: githubData.followers,
      following: githubData.following,
      publicRepos: githubData.publicRepos,
      totalStarsReceived: githubData.totalStarsReceived,
      totalForksReceived: githubData.totalForksReceived,
      totalCommits: githubData.totalCommits,
      languages: githubData.languages,
      bio: githubData.bio,
      name: githubData.name,
      createdAt: githubData.createdAt,
      lastUpdated: githubData.updatedAt,
      
      // Enhanced Gitivity 2.0 stats
      totalPRsOpened: githubData.totalPRsOpened,
      totalPRsMerged: githubData.totalPRsMerged,
      totalIssuesOpened: githubData.totalIssuesOpened,
      totalIssuesClosed: githubData.totalIssuesClosed,
      totalReviewsGiven: githubData.totalReviewsGiven,
      repositoryHealth: githubData.repositoryHealth,
      contributionStreak: githubData.contributionStreak,
      
      // Score breakdown
      scoreBreakdown: {
        total: scoreBreakdown.total,
        creatorScore: scoreBreakdown.creatorScore,
        collaboratorScore: scoreBreakdown.collaboratorScore,
        craftsmanshipScore: scoreBreakdown.craftsmanshipScore,
        achievements: scoreBreakdown.achievements,
        multipliers: scoreBreakdown.multipliers
      },
      
      // Calculated ratios
      finisherRatio: githubData.totalPRsOpened > 0 ? githubData.totalPRsMerged / githubData.totalPRsOpened : 0,
      
      rawRepoData: githubData.rawRepoData,
      rawContributionsData: githubData.rawContributionsData
    }

    // Step 4: Save to Database using upsert with optimized transaction
    userLogger.debug('Saving profile to database')
    const profile = await metrics.time('database-query', async () => {
      // Use a transaction to ensure data consistency and better performance
      return await prisma.$transaction(async (tx) => {
        const upsertedProfile = await tx.gitivityProfile.upsert({
          where: {
            username: username.toLowerCase()
          },
          update: {
            score: scoreBreakdown.total,
            stats: JSON.parse(JSON.stringify(stats)),
            avatarUrl: githubData.avatarUrl,
            updatedAt: new Date()
          },
          create: {
            username: username.toLowerCase(),
            score: scoreBreakdown.total,
            stats: JSON.parse(JSON.stringify(stats)),
            avatarUrl: githubData.avatarUrl
          }
        })

        return upsertedProfile
      }, {
        timeout: 10000, // 10 second timeout for this transaction
        isolationLevel: 'ReadCommitted' // Optimal for this use case
      })
    }, { operation: 'upsert-profile', username })

    // Invalidate caches for this user and update memory cache
    cache.invalidateUser(username)

    // Cache the new profile data in memory
    const newProfileData = {
      ...profile,
      stats: stats as unknown as GitivityProfile['stats'],
    } as GitivityProfile

    cache.setProfile(username, newProfileData, 1800) // 30 minutes

    // Since leaderboard is now dynamic, no need for complex revalidation
    userLogger.info('Profile saved and caches updated', {
      username,
      score: scoreBreakdown.total
    })

    // Step 5: Calculate Rank
    const { rank, totalUsers } = await getUserRank(scoreBreakdown.total, username)
    userLogger.info('Analysis completed successfully', {
      finalScore: scoreBreakdown.total,
      rank,
      totalUsers
    })
    
    // Step 6: Return Result with rank information
    return {
      ...profile,
      rank,
      totalUsers
    } as unknown as GitivityProfile

    } catch (error) {
      userLogger.error('Analysis failed', {}, error as Error)
      return null
    }
  })
}