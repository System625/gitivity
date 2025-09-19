import { prisma } from "@/lib/prisma"
import { LeaderboardClient } from "@/components/leaderboard-client"
import { cache } from "@/lib/cache"

// Disable ISR caching for development - leaderboard needs real-time updates
export const revalidate = 0 // Always fetch fresh data

export default async function LeaderboardPage() {
  // Check cache first
  const cached = cache.getLeaderboard(100)

  if (cached) {
    return (
      <>
        <LeaderboardClient initialProfiles={cached as typeof serializedProfiles} />
      </>
    )
  }

  // Only fetch top 100 profiles initially for better performance
  // Client-side pagination will handle showing more if needed
  const topProfiles = await prisma.gitivityProfile.findMany({
    take: 100, // Limit initial load to top 100 users
    orderBy: {
      score: 'desc'
    },
    select: {
      username: true,
      score: true,
      avatarUrl: true,
      stats: true,
      updatedAt: true
    },
    where: {
      // Only include profiles that have been analyzed (have a score > 0)
      score: {
        gt: 0
      }
    }
  })

  // Convert dates to strings for serialization
  const serializedProfiles = topProfiles.map(profile => ({
    ...profile,
    updatedAt: profile.updatedAt.toISOString()
  }))

  // Cache the result for 1 minute in development for faster updates
  cache.setLeaderboard(serializedProfiles, 100, 60)

  return (
    <>
      <LeaderboardClient initialProfiles={serializedProfiles} />
    </>
  )
}