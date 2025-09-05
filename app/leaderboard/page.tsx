import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import { type GitivityStats } from "@/lib/analysis"

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
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top developers ranked by their Gitivity Score
          </p>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Developer</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Repos</TableHead>
                <TableHead className="text-center">Stars</TableHead>
                <TableHead className="text-center">Followers</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProfiles.map((profile, index) => {
                const stats = profile.stats as unknown as GitivityStats
                const rank = index + 1
                
                return (
                  <TableRow key={profile.username}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {rank <= 3 && (
                          <span className="text-lg">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className={rank <= 3 ? 'font-bold' : ''}>
                          #{rank}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {profile.avatarUrl && (
                          <Image
                            src={profile.avatarUrl}
                            alt={profile.username}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full border"
                          />
                        )}
                        <div>
                          <div className="font-medium">{stats?.name || profile.username}</div>
                          <div className="text-sm text-muted-foreground">
                            @{profile.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-primary">
                      {profile.score.toLocaleString()}%
                    </TableCell>
                    <TableCell className="text-center">
                      {stats?.publicRepos?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {stats?.totalStarsReceived?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {stats?.followers?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {topProfiles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No profiles found. Be the first to get analyzed!</p>
            </div>
          )}
        </div>

        {topProfiles.length === 50 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing top 50 developers
          </div>
        )}
      </div>
    </div>
  )
}