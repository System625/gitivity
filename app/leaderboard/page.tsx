import { prisma } from "@/lib/prisma"
import { LeaderboardClient } from "@/components/leaderboard-client"

// Make leaderboard dynamic to show real-time updates
export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const topProfiles = await prisma.gitivityProfile.findMany({
    orderBy: {
      score: 'desc'
    },
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