import { prisma } from "@/lib/prisma"
import { getGithubProfileData, type GitHubProfileData } from "@/lib/github"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
}

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
}

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

function calculateCreatorScore(data: GitHubProfileData): number {
  let score = 0

  // Stars component (0-50 points) - made harder to max out
  const starScore = Math.min(50, data.totalStarsReceived * 2) // 25 stars = 50 points
  score += starScore

  // Repository portfolio component (0-25 points)
  const repoScore = Math.min(25, Math.log10(Math.max(1, data.publicRepos)) * 12) // Diminishing returns
  score += repoScore

  // Fork component (0-15 points) - made harder
  const forkScore = Math.min(15, data.totalForksReceived * 5) // 3 forks = 15 points
  score += forkScore

  // Repository health bonus (0-10 points)
  const healthBonus = data.repositoryHealth.ratio * 10
  score += healthBonus

  return score // Can exceed 100 before capping at base level
}

function calculateCollaboratorScore(data: GitHubProfileData): number {
  let score = 0

  // Pull Request component (0-60 points) - made harder to max
  const prScore = Math.min(60, data.totalPRsMerged * 0.3) // 200 merged PRs = 60 points
  score += prScore

  // Issue contribution component (0-15 points)
  const issueScore = Math.min(15, data.totalIssuesClosed * 1.5) // 10 issues = 15 points
  score += issueScore

  // Code review component (0-15 points) - mentorship, made harder
  const reviewScore = Math.min(15, data.totalReviewsGiven * 1) // 15 reviews = 15 points
  score += reviewScore

  // Finisher ratio bonus (0-10 points)
  const finisherRatio = data.totalPRsOpened > 0 
    ? data.totalPRsMerged / data.totalPRsOpened 
    : 1.0
  const finisherBonus = finisherRatio * 10 // Perfect finisher gets 10 bonus points
  score += finisherBonus

  return score // Can exceed 100 before base capping
}

function calculateCraftsmanshipScore(data: GitHubProfileData): number {
  let score = 0

  // Commit activity component (0-50 points) - made harder
  const commitScore = Math.min(50, data.totalCommits * 0.04) // 1250 commits = 50 points
  score += commitScore

  // Language diversity component (0-20 points) - made slightly harder
  const languageScore = Math.min(20, data.languages.length * 4) // 5 languages = 20 points
  score += languageScore

  // Contribution streak component (0-20 points)
  const streakScore = Math.min(20, data.contributionStreak.current * 1) // 20 day streak = 20 points
  score += streakScore

  // Account maturity component (0-10 points) - reduced weight
  const accountAge = (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
  const maturityScore = Math.min(10, Math.log10(Math.max(1, accountAge)) * 5) // 10 years = 10 points
  score += maturityScore

  return score // Can exceed 100 before base capping
}

function calculateAchievements(data: GitHubProfileData): Achievement[] {
  const achievements: Achievement[] = []

  // Polyglot Badge
  if (data.languages.length >= 3) {
    achievements.push({
      id: 'polyglot',
      name: 'Polyglot',
      description: `Master of ${data.languages.length} programming languages`,
      icon: '🌍',
      earned: true
    })
  }

  // Mentor Badge
  if (data.totalReviewsGiven >= 10) {
    achievements.push({
      id: 'mentor',
      name: 'Mentor',
      description: `Provided ${data.totalReviewsGiven} code reviews`,
      icon: '🎓',
      earned: true
    })
  }

  // Consistency Badge
  if (data.contributionStreak.current >= 10) {
    achievements.push({
      id: 'consistent',
      name: 'Consistency Champion',
      description: 'Maintains regular contribution patterns',
      icon: '🔥',
      earned: true
    })
  }

  // Finisher Badge
  const finisherRatio = data.totalPRsOpened > 0 ? data.totalPRsMerged / data.totalPRsOpened : 0
  if (finisherRatio >= 0.8 && data.totalPRsMerged >= 5) {
    achievements.push({
      id: 'finisher',
      name: 'Finisher',
      description: `${Math.round(finisherRatio * 100)}% PR completion rate`,
      icon: '✅',
      earned: true
    })
  }

  // Creator Badge
  if (data.totalStarsReceived >= 10) {
    achievements.push({
      id: 'creator',
      name: 'Creator',
      description: `Projects earned ${data.totalStarsReceived} stars`,
      icon: '⭐',
      earned: true
    })
  }

  return achievements
}

function calculateMultipliers(data: GitHubProfileData, achievements: Achievement[]): { name: string; value: number }[] {
  const multipliers: { name: string; value: number }[] = []

  // Achievement multipliers
  achievements.forEach(achievement => {
    if (achievement.earned) {
      switch (achievement.id) {
        case 'polyglot':
          multipliers.push({ name: 'Polyglot Bonus', value: 1.1 })
          break
        case 'mentor':
          multipliers.push({ name: 'Mentor Bonus', value: 1.15 })
          break
        case 'consistent':
          multipliers.push({ name: 'Consistency Bonus', value: 1.1 })
          break
        case 'creator':
          multipliers.push({ name: 'Creator Bonus', value: 1.2 })
          break
      }
    }
  })

  // Activity recency multiplier
  const daysSinceLastUpdate = (Date.now() - new Date(data.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceLastUpdate < 30) {
    multipliers.push({ name: 'Recent Activity', value: 1.1 })
  } else if (daysSinceLastUpdate < 90) {
    multipliers.push({ name: 'Active Developer', value: 1.05 })
  }

  return multipliers
}

export type { Achievement, GitivityScoreBreakdown, GitivityStats, GitivityProfile }

export async function analyzeUser(username: string): Promise<GitivityProfile | null> {
  try {
    // Step 1: Check Cache - TEMPORARILY DISABLED FOR TESTING NEW SCORING
    // const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // const cachedProfile = await prisma.gitivityProfile.findFirst({
    //   where: {
    //     username: username.toLowerCase(),
    //     updatedAt: {
    //       gte: twentyFourHoursAgo
    //     }
    //   }
    // })

    // if (cachedProfile) {
    //   return cachedProfile
    // }

    // Step 2: Fetch Live Data
    const githubData = await getGithubProfileData(username)
    
    if (!githubData) {
      console.error(`Failed to fetch GitHub data for user: ${username}`)
      return null
    }

    // Step 3: Calculate Score with new multi-dimensional system
    const scoreBreakdown = calculateGitivityScore(githubData)

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

    // Step 4: Save to Database using upsert
    const profile = await prisma.gitivityProfile.upsert({
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

    // Step 5: Return Result
    return profile as unknown as GitivityProfile

  } catch (error) {
    console.error('Error in analyzeUser:', error)
    return null
  }
}