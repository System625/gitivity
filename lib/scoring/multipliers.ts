import type { GitHubProfileData } from "@/lib/github"
import type { Achievement } from "./achievements"

/**
 * Calculates score multipliers based on achievements and activity recency.
 * Multipliers can push elite developers above 100% total score.
 * 
 * @param data - GitHub profile data for activity recency calculation
 * @param achievements - Array of earned achievements that grant multipliers
 * @returns Array of multiplier objects with names and values
 * 
 * @example
 * // User with Star Creator + GitHub Veteran + Active This Week
 * const multipliers = calculateMultipliers(data, achievements)
 * // Returns: [
 * //   { name: 'Star Creator', value: 1.25 },
 * //   { name: 'GitHub Veteran', value: 1.2 }, 
 * //   { name: 'Active This Week', value: 1.1 }
 * // ]
 * // Total multiplier: 1.25 × 1.2 × 1.1 = 1.65x
 * 
 * Multiplier Sources:
 * - Elite Achievements: 1.05x - 1.5x based on achievement tier
 * - Activity Recency: 1.02x - 1.1x based on last update timing
 */
export function calculateMultipliers(data: GitHubProfileData, achievements: Achievement[]): { name: string; value: number }[] {
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