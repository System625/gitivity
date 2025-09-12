import type { GitHubProfileData } from "@/lib/github"

/**
 * Calculates the Creator Score pillar (0-100 points)
 * Measures the impact and quality of personal projects and repositories.
 * 
 * @param data - GitHub profile data containing user statistics
 * @returns Score from 0-100 representing creator impact
 * 
 * @example
 * // User with 1000 stars, 100 forks, 50 repos, good health
 * const score = calculateCreatorScore(data) // Returns ~47 points
 * 
 * Breakdown:
 * - Stars (0-40): Logarithmic scaling for viral impact
 * - Forks (0-30): Network effect and adoption measurement  
 * - Repository Portfolio (0-20): Quality over quantity approach
 * - Repository Health (0-10): Maintenance quality bonus
 */
export function calculateCreatorScore(data: GitHubProfileData): number {
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

/**
 * Calculates the Collaborator Score pillar (0-100 points)
 * Measures contribution to the broader open source ecosystem and community involvement.
 * 
 * @param data - GitHub profile data containing collaboration metrics
 * @returns Score from 0-100 representing collaboration impact
 * 
 * @example
 * // User with 500 merged PRs, 200 closed issues, 100 reviews, 90% finisher ratio
 * const score = calculateCollaboratorScore(data) // Returns ~69 points
 * 
 * Breakdown:
 * - Pull Requests (0-50): Community contributions via merged PRs
 * - Issue Resolution (0-20): Problem solving and bug fixes
 * - Code Reviews (0-20): Mentorship and collaboration
 * - Finisher Ratio (0-10): Quality bonus for PR completion rate
 */
export function calculateCollaboratorScore(data: GitHubProfileData): number {
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

/**
 * Calculates the Craftsmanship Score pillar (0-100 points)  
 * Measures technical skill, consistency, and professional development practices.
 * 
 * @param data - GitHub profile data containing development metrics
 * @returns Score from 0-100 representing craftsmanship quality
 * 
 * @example
 * // User with 5000 commits, 8 languages, 45-day streak, 7 years experience
 * const score = calculateCraftsmanshipScore(data) // Returns ~78 points
 * 
 * Breakdown:
 * - Commit Activity (0-40): Coding volume and prolificacy
 * - Language Diversity (0-25): Technical breadth and adaptability
 * - Contribution Consistency (0-20): Sustained development effort
 * - Account Maturity (0-15): Experience and professional longevity
 */
export function calculateCraftsmanshipScore(data: GitHubProfileData): number {
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