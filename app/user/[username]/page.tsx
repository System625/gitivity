import { notFound } from "next/navigation"
import { analyzeUser, type GitivityStats } from "@/lib/analysis"
import { BentoCard } from "@/components/ui/bento-card"
import Image from "next/image"

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  const profile = await analyzeUser(params.username)
  
  if (!profile) {
    return {
      title: 'User Not Found - Gitivity'
    }
  }

  const ogImageUrl = `/api/og?username=${profile.username}&score=${profile.score}&avatar=${encodeURIComponent(profile.avatarUrl || '')}`

  return {
    title: `${profile.username} - Gitivity Score: ${profile.score}%`,
    description: `Check out ${profile.username}'s GitHub activity analysis and Gitivity Score of ${profile.score}%`,
    openGraph: {
      title: `${profile.username} - Gitivity`,
      description: `Gitivity Score: ${profile.score}%`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${profile.username}'s Gitivity Score`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.username} - Gitivity`,
      description: `Gitivity Score: ${profile.score}%`,
      images: [ogImageUrl]
    }
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const profile = await analyzeUser(params.username)

  if (!profile) {
    notFound()
  }

  const stats = profile.stats as unknown as GitivityStats

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          {profile.avatarUrl && (
            <Image
              src={profile.avatarUrl}
              alt={profile.username}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-4 border-[#7b3b4b]"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold">{stats?.name || profile.username}</h1>
            <p className="text-xl text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-6xl font-bold text-[#7b3b4b] mb-2">
            {profile.score}%
          </div>
          <div className="text-xl text-muted-foreground">Gitivity Score</div>
        </div>

        {stats?.bio && (
          <p className="text-muted-foreground max-w-2xl mx-auto">{stats.bio}</p>
        )}
      </div>

      {/* Score Breakdown */}
      {stats?.scoreBreakdown && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Score Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-6 bg-[#2d314e] rounded-lg border border-white/10">
              <div className="text-3xl font-bold text-[#7b3b4b] mb-2">
                {stats.scoreBreakdown.creatorScore}
              </div>
              <div className="text-white font-semibold mb-1">Creator Score</div>
              <div className="text-white/60 text-sm">Personal project impact</div>
            </div>
            <div className="text-center p-6 bg-[#2d314e] rounded-lg border border-white/10">
              <div className="text-3xl font-bold text-[#7b3b4b] mb-2">
                {stats.scoreBreakdown.collaboratorScore}
              </div>
              <div className="text-white font-semibold mb-1">Collaborator Score</div>
              <div className="text-white/60 text-sm">Open source contributions</div>
            </div>
            <div className="text-center p-6 bg-[#2d314e] rounded-lg border border-white/10">
              <div className="text-3xl font-bold text-[#7b3b4b] mb-2">
                {stats.scoreBreakdown.craftsmanshipScore}
              </div>
              <div className="text-white font-semibold mb-1">Craftsmanship Score</div>
              <div className="text-white/60 text-sm">Quality & consistency</div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {stats?.scoreBreakdown?.achievements && stats.scoreBreakdown.achievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Achievements</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {stats.scoreBreakdown.achievements.map((achievement) => (
              <div key={achievement.id} className="bg-[#2d314e] rounded-lg border border-white/10 p-4 text-center min-w-[200px]">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-semibold text-white mb-1">{achievement.name}</div>
                <div className="text-white/60 text-sm">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Creator Stats */}
        <BentoCard title="Creator Impact" icon="⭐">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Public Repos</span>
              <span className="font-mono font-semibold">{stats?.publicRepos?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Stars Received</span>
              <span className="font-mono font-semibold text-yellow-400">⭐ {stats?.totalStarsReceived?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Forks Received</span>
              <span className="font-mono font-semibold">🍴 {stats?.totalForksReceived?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Repo Health</span>
              <span className="font-mono font-semibold text-green-400">
                {stats?.repositoryHealth !== undefined ? `${Math.round(stats.repositoryHealth.ratio * 100)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </BentoCard>

        {/* Collaborator Stats */}
        <BentoCard title="Collaboration" icon="🤝">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>PRs Opened</span>
              <span className="font-mono font-semibold">{stats?.totalPRsOpened?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>PRs Merged</span>
              <span className="font-mono font-semibold text-green-400">{stats?.totalPRsMerged?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Finisher Ratio</span>
              <span className="font-mono font-semibold text-blue-400">
                {stats?.finisherRatio ? `${Math.round(stats.finisherRatio * 100)}%` : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Code Reviews</span>
              <span className="font-mono font-semibold">{stats?.totalReviewsGiven?.toLocaleString() || 0}</span>
            </div>
          </div>
        </BentoCard>

        {/* Craftsmanship Stats */}
        <BentoCard title="Craftsmanship" icon="🛠️">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Total Commits</span>
              <span className="font-mono font-semibold">{stats?.totalCommits?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Languages</span>
              <span className="font-mono font-semibold">{stats?.languages?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Issues Closed</span>
              <span className="font-mono font-semibold">{stats?.totalIssuesClosed?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Account Age</span>
              <span className="font-mono font-semibold">
                {stats?.createdAt ? 
                  `${Math.floor((Date.now() - new Date(stats.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))} years` 
                  : 'Unknown'
                }
              </span>
            </div>
          </div>
        </BentoCard>

        {/* Community Stats */}
        <BentoCard title="Community" icon="👥">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Followers</span>
              <span className="font-mono font-semibold">{stats?.followers?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Following</span>
              <span className="font-mono font-semibold">{stats?.following?.toLocaleString() || 0}</span>
            </div>
          </div>
        </BentoCard>

        {/* Top Languages */}
        {stats?.languages && stats.languages.length > 0 && (
          <BentoCard title="Top Languages" icon="💻" className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.languages.slice(0, 6).map((lang) => (
                <div key={lang.name} className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="font-semibold text-[#7b3b4b]">{lang.name}</div>
                  <div className="text-sm text-white/60">{lang.percentage}%</div>
                </div>
              ))}
            </div>
          </BentoCard>
        )}
      </div>

      {/* Share Section */}
      <div className="text-center space-y-4 pt-8">
        <h3 className="text-xl font-semibold">Share Your Score</h3>
        <div className="text-sm text-muted-foreground">
          Copy this link to share your Gitivity profile:
        </div>
        <div className="bg-muted px-4 py-2 rounded-md font-mono text-sm max-w-md mx-auto">
          {typeof window !== 'undefined' ? window.location.href : `https://gitivity.vercel.app/user/${profile.username}`}
        </div>
      </div>
    </div>
  )
}