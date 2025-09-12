import { prisma } from "@/lib/prisma"
import { LeaderboardClient } from "@/components/leaderboard-client"

// Use ISR with 5-minute revalidation - good balance of freshness and performance
export const revalidate = 300 // 5 minutes

export default async function LeaderboardPage() {
  const topProfiles = await prisma.gitivityProfile.findMany({
    orderBy: {
      score: 'desc'
    },
    take: 50,
    select: {
      username: true,
      score: true,
      avatarUrl: true,
      stats: true,
      updatedAt: true
    }
  })

  // Convert dates to strings for serialization
  const serializedProfiles = topProfiles.map(profile => ({
    ...profile,
    updatedAt: profile.updatedAt.toISOString()
  }))

  return (
    <>      
      <LeaderboardClient initialProfiles={serializedProfiles} />
    </>
  )
}