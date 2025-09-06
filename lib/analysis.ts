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
  
  // ✨ STARS - Logarithmic scaling for viral impact (0-40 points)
  // 1 star = 5pts, 10 stars = 10pts, 100 stars = 15pts, 1K stars = 20pts, 10K stars = 25pts, 24K stars = ~27pts
  const starScore = Math.min(40, Math.log10(Math.max(1, data.totalStarsReceived)) * 8)
  score += starScore
  
  // 🍴 FORKS - Network effect scaling (0-30 points)  
  // 1 fork = 3pts, 10 forks = 6pts, 100 forks = 9pts, 1K forks = 12pts, 10K forks = 15pts, 158K forks = ~19pts
  const forkScore = Math.min(30, Math.log10(Math.max(1, data.totalForksReceived)) * 6)
  score += forkScore
  
  // 📦 REPOSITORY PORTFOLIO - Quality over quantity (0-20 points)
  // Balanced approach: 10 repos = 12pts, 50 repos = 17pts, 200+ repos = 20pts
  const repoScore = Math.min(20, Math.log10(Math.max(1, data.publicRepos)) * 10)
  score += repoScore
  
  // 💚 REPOSITORY HEALTH - Maintenance quality (0-10 points)
  const healthBonus = data.repositoryHealth.ratio * 10
  score += healthBonus
  
  return Math.min(score, 100) // Cap at 100 for this pillar
}

function calculateCollaboratorScore(data: GitHubProfileData): number {
  let score = 0

  // 🔥 PULL REQUESTS - Logarithmic scaling for high-volume contributors (0-50 points)
  // 1 PR = 8pts, 10 PRs = 16pts, 100 PRs = 24pts, 1K PRs = 32pts, 10K PRs = 40pts
  const prScore = Math.min(50, Math.log10(Math.max(1, data.totalPRsMerged)) * 16)
  score += prScore

  // 🐛 ISSUE RESOLUTION - Community problem solving (0-20 points)
  // 1 issue = 6pts, 10 issues = 12pts, 100 issues = 18pts, 1K issues = 20pts
  const issueScore = Math.min(20, Math.log10(Math.max(1, data.totalIssuesClosed)) * 6)
  score += issueScore

  // 👥 CODE REVIEWS - Mentorship and collaboration (0-20 points)
  // 1 review = 5pts, 10 reviews = 10pts, 100 reviews = 15pts, 1K reviews = 20pts
  const reviewScore = Math.min(20, Math.log10(Math.max(1, data.totalReviewsGiven)) * 5)
  score += reviewScore

  // ✅ FINISHER RATIO - Execution quality bonus (0-10 points)
  const finisherRatio = data.totalPRsOpened > 0 
    ? data.totalPRsMerged / data.totalPRsOpened 
    : 1.0
  const finisherBonus = finisherRatio * 10 // Perfect finisher gets 10 bonus points
  score += finisherBonus

  return Math.min(score, 100) // Cap at 100 for this pillar
}

function calculateCraftsmanshipScore(data: GitHubProfileData): number {
  let score = 0

  // 📈 COMMIT ACTIVITY - Logarithmic scaling for prolific coders (0-40 points)
  // 10 commits = 8pts, 100 commits = 16pts, 1K commits = 24pts, 10K commits = 32pts, 100K commits = 40pts
  const commitScore = Math.min(40, Math.log10(Math.max(1, data.totalCommits)) * 8)
  score += commitScore

  // 🌍 LANGUAGE DIVERSITY - Technical breadth (0-25 points)
  // 1 lang = 8pts, 3 langs = 15pts, 5 langs = 20pts, 10+ langs = 25pts
  const languageScore = Math.min(25, data.languages.length * 3 + Math.log10(Math.max(1, data.languages.length)) * 5)
  score += languageScore

  // 🔥 CONTRIBUTION CONSISTENCY - Sustained effort (0-20 points)
  // Linear scaling for streaks: 10 days = 10pts, 30 days = 20pts
  const streakScore = Math.min(20, data.contributionStreak.current * 0.67)
  score += streakScore

  // 🏛️ ACCOUNT MATURITY - Experience bonus (0-15 points)
  // More weight for experience: 1 year = 5pts, 5 years = 10pts, 14 years = 14pts
  const accountAge = (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
  const maturityScore = Math.min(15, Math.log10(Math.max(1, accountAge)) * 7)
  score += maturityScore

  return Math.min(score, 100) // Cap at 100 for this pillar
}

function calculateAchievements(data: GitHubProfileData): Achievement[] {
  const achievements: Achievement[] = []

  // 🌟 VIRAL CREATOR - Exceptional impact
  if (data.totalStarsReceived >= 10000) {
    achievements.push({
      id: 'viral-creator',
      name: 'Viral Creator',
      description: `${data.totalStarsReceived.toLocaleString()} stars - Exceptional impact`,
      icon: '🌟',
      earned: true
    })
  } else if (data.totalStarsReceived >= 1000) {
    achievements.push({
      id: 'star-creator',
      name: 'Star Creator', 
      description: `${data.totalStarsReceived.toLocaleString()} stars earned`,
      icon: '⭐',
      earned: true
    })
  } else if (data.totalStarsReceived >= 100) {
    achievements.push({
      id: 'rising-star',
      name: 'Rising Star',
      description: `${data.totalStarsReceived} stars earned`,
      icon: '✨',
      earned: true
    })
  }

  // 🚀 NETWORK EFFECT - Fork multiplication
  if (data.totalForksReceived >= 50000) {
    achievements.push({
      id: 'ecosystem-builder',
      name: 'Ecosystem Builder',
      description: `${data.totalForksReceived.toLocaleString()} forks - Massive adoption`,
      icon: '🚀',
      earned: true
    })
  } else if (data.totalForksReceived >= 1000) {
    achievements.push({
      id: 'community-favorite',
      name: 'Community Favorite',
      description: `${data.totalForksReceived.toLocaleString()} forks`,
      icon: '💖',
      earned: true
    })
  }

  // 👥 INFLUENCE - Follower count
  if (data.followers >= 10000) {
    achievements.push({
      id: 'influencer',
      name: 'GitHub Influencer',
      description: `${data.followers.toLocaleString()} followers`,
      icon: '👑',
      earned: true
    })
  } else if (data.followers >= 1000) {
    achievements.push({
      id: 'community-leader',
      name: 'Community Leader',
      description: `${data.followers.toLocaleString()} followers`,
      icon: '👥',
      earned: true
    })
  }

  // 🌍 POLYGLOT - Language mastery
  if (data.languages.length >= 10) {
    achievements.push({
      id: 'polyglot-master',
      name: 'Polyglot Master',
      description: `Expert in ${data.languages.length} languages`,
      icon: '🌍',
      earned: true
    })
  } else if (data.languages.length >= 5) {
    achievements.push({
      id: 'polyglot',
      name: 'Polyglot',
      description: `Proficient in ${data.languages.length} languages`,
      icon: '🗣️',
      earned: true
    })
  }

  // 🏛️ VETERAN - Account age
  const accountAge = (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)
  if (accountAge >= 10) {
    achievements.push({
      id: 'veteran',
      name: 'GitHub Veteran',
      description: `${Math.floor(accountAge)} years of experience`,
      icon: '🏛️',
      earned: true
    })
  }

  // 🔥 CONSISTENCY - Streak tracking
  if (data.contributionStreak.current >= 100) {
    achievements.push({
      id: 'consistency-master',
      name: 'Consistency Master',
      description: `${data.contributionStreak.current} day streak`,
      icon: '🔥',
      earned: true
    })
  } else if (data.contributionStreak.current >= 30) {
    achievements.push({
      id: 'consistent',
      name: 'Consistent Contributor',
      description: `${data.contributionStreak.current} day streak`,
      icon: '📈',
      earned: true
    })
  }

  return achievements
}

function calculateMultipliers(data: GitHubProfileData, achievements: Achievement[]): { name: string; value: number }[] {
  const multipliers: { name: string; value: number }[] = []

  // 🚀 ELITE TIER MULTIPLIERS - For world-class contributors
  achievements.forEach(achievement => {
    if (achievement.earned) {
      switch (achievement.id) {
        case 'viral-creator':
          multipliers.push({ name: 'Viral Creator Elite', value: 1.5 })
          break
        case 'ecosystem-builder':
          multipliers.push({ name: 'Ecosystem Builder Elite', value: 1.4 })
          break
        case 'influencer':
          multipliers.push({ name: 'GitHub Influencer', value: 1.3 })
          break
        case 'star-creator':
          multipliers.push({ name: 'Star Creator', value: 1.25 })
          break
        case 'community-favorite':
          multipliers.push({ name: 'Community Favorite', value: 1.2 })
          break
        case 'community-leader':
          multipliers.push({ name: 'Community Leader', value: 1.15 })
          break
        case 'veteran':
          multipliers.push({ name: 'GitHub Veteran', value: 1.2 })
          break
        case 'polyglot-master':
          multipliers.push({ name: 'Polyglot Master', value: 1.15 })
          break
        case 'consistency-master':
          multipliers.push({ name: 'Consistency Master', value: 1.15 })
          break
        case 'rising-star':
          multipliers.push({ name: 'Rising Star', value: 1.1 })
          break
        case 'polyglot':
          multipliers.push({ name: 'Polyglot', value: 1.08 })
          break
        case 'consistent':
          multipliers.push({ name: 'Consistent Contributor', value: 1.05 })
          break
      }
    }
  })
  
  // 📈 ACTIVITY RECENCY MULTIPLIER
  const daysSinceLastUpdate = (Date.now() - new Date(data.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceLastUpdate < 7) {
    multipliers.push({ name: 'Active This Week', value: 1.1 })
  } else if (daysSinceLastUpdate < 30) {
    multipliers.push({ name: 'Recent Activity', value: 1.05 })
  } else if (daysSinceLastUpdate < 90) {
    multipliers.push({ name: 'Active Developer', value: 1.02 })
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