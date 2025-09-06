import { prisma } from "@/lib/prisma"
import { LeaderboardClient } from "@/components/leaderboard-client"
import Link from "next/link"
import { Icon } from "@iconify/react"

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

  return (
    <>      
      <LeaderboardClient initialProfiles={topProfiles} />
    </>
  )
}