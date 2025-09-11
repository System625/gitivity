import { prisma } from "@/lib/prisma"
import { LeaderboardClient } from "@/components/leaderboard-client"

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