import type { GitHubProfileData } from "@/lib/github"

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
}

/**
 * Calculates achievements earned by a GitHub user based on their profile data.
 * Achievements provide recognition for exceptional performance in specific areas.
 * 
 * @param data - GitHub profile data containing user statistics
 * @returns Array of Achievement objects with earned status
 * 
 * @example
 * // User with 5000 stars, 500 forks, 2000 followers, 8 languages, 5 years
 * const achievements = calculateAchievements(data)
 * // Returns: [StarCreator, CommunityLeader, Polyglot, ...]
 * 
 * Achievement Categories:
 * - Impact: Based on stars received (Rising Star → Star Creator → Viral Creator)
 * - Adoption: Based on forks received (Community Favorite → Ecosystem Builder) 
 * - Influence: Based on followers (Community Leader → GitHub Influencer)
 * - Versatility: Based on languages (Polyglot → Polyglot Master)
 * - Experience: Based on account age (GitHub Veteran)
 * - Consistency: Based on contribution streaks (Consistent → Consistency Master)
 */
export function calculateAchievements(data: GitHubProfileData): Achievement[] {
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