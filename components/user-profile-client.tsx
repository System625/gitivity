"use client"
import { BentoCard } from "@/components/ui/bento-card"
import { GlowCard } from "@/components/spotlight-card"
import { CometCard } from "@/components/ui/comet-card"
import { ProfileActions } from "@/components/profile-actions"
import { LanguagesOrbitalTimeline } from "@/components/ui/languages-orbital-timeline"
import { CopyLinkButton } from "@/components/copy-link-button"
import { Icon } from "@iconify/react"
import Image from "next/image"
import { useState, useRef } from "react"
import { useToPng } from "@hugocxl/react-to-image"
import { GitivityStats } from "@/lib/analysis"

interface UserProfileClientProps {
  profile: {
    username: string
    score: number
    avatarUrl?: string | null
    stats: unknown
    rank?: number
    totalUsers?: number
  }
  stats: GitivityStats
}

export function UserProfileClient({ profile, stats }: UserProfileClientProps) {
  const [isStatic, setIsStatic] = useState(false)
  const [isDownloadMode, setIsDownloadMode] = useState(false) // eslint-disable-line @typescript-eslint/no-unused-vars
  const cardRef = useRef<HTMLDivElement>(null)
  
  const [, convertToPng, cardRefCallback] = useToPng<HTMLDivElement>({
    onSuccess: (data) => {
      const link = document.createElement('a')
      link.download = `${profile.username}-gitivity-profile.png`
      link.href = data
      link.click()
      setIsStatic(false)
      setIsDownloadMode(false)
    },
    onError: (error) => {
      console.error('Error downloading card:', error)
      alert('Failed to download the card. Please try again.')
      setIsStatic(false)
      setIsDownloadMode(false)
    },
    backgroundColor: undefined,
    pixelRatio: 2,
    style: {
      borderRadius: '12px',
      overflow: 'hidden'
    },
    filter: () => {
      // Ensure we're capturing the styled version
      return true
    },
    // Enhanced options for better CSS resolution
    includeQueryParams: true,
    skipAutoScale: false,
    canvasWidth: 600,
    canvasHeight: 600
  })

  const downloadCard = async () => {
    setIsStatic(true)
    setIsDownloadMode(true)
    
    // Detect current theme
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches || 
                      document.documentElement.classList.contains('dark')
    
    // Wait a moment for the static state to take effect
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Apply enhanced styling for light mode downloads
    if (!isDarkMode && cardRef.current) {
      const cardElement = cardRef.current
      const originalBoxShadow = cardElement.style.boxShadow
      const originalBorder = cardElement.style.border
      
      // Add enhanced styling for better contrast in light mode
      cardElement.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(0, 0, 0, 0.08)'
      cardElement.style.border = '1px solid rgba(0, 0, 0, 0.15)'
      cardElement.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.98) 100%)'
      
      // Enhance text contrast for score breakdown sections
      const scoreSections = cardElement.querySelectorAll('.bg-muted\\/30')
      scoreSections.forEach((section: Element) => {
        if (section instanceof HTMLElement) {
          section.style.background = 'rgba(0, 0, 0, 0.06)'
          section.style.border = '1px solid rgba(0, 0, 0, 0.08)'
        }
      })
      
      // Enhance achievement cards contrast
      const achievementCards = cardElement.querySelectorAll('.bg-white\\/5')
      achievementCards.forEach((card: Element) => {
        if (card instanceof HTMLElement) {
          card.style.background = 'rgba(0, 0, 0, 0.05)'
          card.style.border = '1px solid rgba(0, 0, 0, 0.1)'
        }
      })
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100))
      
      try {
        await convertToPng()
      } finally {
        // Restore original styling
        cardElement.style.boxShadow = originalBoxShadow
        cardElement.style.border = originalBorder
        cardElement.style.background = ''
        
        // Restore score sections
        const scoreSections = cardElement.querySelectorAll('.bg-muted\\/30')
        scoreSections.forEach((section: Element) => {
          if (section instanceof HTMLElement) {
            section.style.background = ''
            section.style.border = ''
          }
        })
        
        // Restore achievement cards
        const achievementCards = cardElement.querySelectorAll('.bg-white\\/5')
        achievementCards.forEach((card: Element) => {
          if (card instanceof HTMLElement) {
            card.style.background = ''
            card.style.border = ''
          }
        })
      }
    } else {
      convertToPng()
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Desktop Layout: Comet Card Left, Stats Cards Right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Profile Card - Left Side */}
        <div className="lg:w-1/2">
          <CometCard className="comet-card-container" isStatic={isStatic}>
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-4 w-full">
              <div ref={(node) => {
                if (node) cardRefCallback(node)
                cardRef.current = node
              }} className="bg-card rounded-[12px] border border-border shadow-sm p-4">
              {/* Header Section */}
              <div className="text-center space-y-3 mb-4">
                <div className="flex items-center justify-center gap-3">
                  {profile.avatarUrl && (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.username}
                      width={60}
                      height={60}
                      className="w-15 h-15 rounded-full border-2 border-[#7b3b4b]"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{stats?.name || profile.username}</h1>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#7b3b4b] mb-1">
                    {profile.score}%
                  </div>
                  <div className="text-sm text-muted-foreground">Gitivity Score</div>
                  {profile.rank && profile.totalUsers && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Rank #{profile.rank.toLocaleString()} out of {profile.totalUsers.toLocaleString()}
                    </div>
                  )}
                </div>

                {stats?.bio && (
                  <p className="text-muted-foreground text-sm max-w-lg mx-auto line-clamp-2">{stats.bio}</p>
                )}
              </div>

              {/* Score Breakdown */}
              {stats?.scoreBreakdown && (
                <div>
                  <h2 className="text-lg font-bold text-center mb-3 text-foreground">Score Breakdown</h2>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Icon icon="mdi:star-outline" className="text-xl text-[#7b3b4b]" />
                      </div>
                      <div className="text-lg font-bold text-[#7b3b4b] mb-1">
                        {stats.scoreBreakdown.creatorScore}
                      </div>
                      <div className="text-foreground font-semibold text-xs mb-1">Creator</div>
                      <div className="text-muted-foreground text-xs">Personal impact</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Icon icon="mdi:handshake-outline" className="text-xl text-[#7b3b4b]" />
                      </div>
                      <div className="text-lg font-bold text-[#7b3b4b] mb-1">
                        {stats.scoreBreakdown.collaboratorScore}
                      </div>
                      <div className="text-foreground font-semibold text-xs mb-1">Collaborator</div>
                      <div className="text-muted-foreground text-xs">Open source</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Icon icon="mdi:tools" className="text-xl text-[#7b3b4b]" />
                      </div>
                      <div className="text-lg font-bold text-[#7b3b4b] mb-1">
                        {stats.scoreBreakdown.craftsmanshipScore}
                      </div>
                      <div className="text-foreground font-semibold text-xs mb-1">Craftsmanship</div>
                      <div className="text-muted-foreground text-xs">Quality</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements */}
              {stats?.scoreBreakdown?.achievements && stats.scoreBreakdown.achievements.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h2 className="text-lg font-bold text-center mb-3 text-foreground">Achievements</h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {stats.scoreBreakdown.achievements.slice(0, 4).map((achievement) => {
                      // Map emoji icons to Iconify icons
                      const iconMap: Record<string, string> = {
                        '🚀': 'mdi:rocket-launch-outline',
                        '🤝': 'mdi:handshake-outline',
                        '🏆': 'mdi:trophy-outline',
                        '⭐': 'mdi:star-outline',
                        '🔥': 'mdi:fire',
                        '💎': 'mdi:diamond-outline',
                        '🎯': 'mdi:target',
                        '👑': 'mdi:crown-outline',
                        '🛡️': 'mdi:shield-outline',
                        '⚡': 'mdi:lightning-bolt-outline'
                      }
                      const iconName = iconMap[achievement.icon] || 'mdi:star-outline'
                      
                      return (
                        <div key={achievement.id} className="bg-white/5 rounded-lg border border-white/10 p-2 text-center min-w-[120px] max-w-[140px]">
                          <div className="flex items-center justify-center mb-1">
                            <Icon icon={iconName} className="text-2xl text-[#7b3b4b]" />
                          </div>
                          <div className="font-semibold text-foreground mb-1 text-xs">{achievement.name}</div>
                          <div className="text-muted-foreground text-xs">{achievement.description}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              </div>

              {/* Profile Actions */}
              <ProfileActions onDownload={downloadCard} />
            </div>
          </CometCard>
        </div>

        {/* Stats Cards - Right Side */}
        <div className="lg:w-1/2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creator Stats */}
            <GlowCard glowColor="blue" customSize className="h-full">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:star-outline" className="text-xl text-blue-400" />
                  <h3 className="text-lg font-semibold text-card-foreground">Creator Impact</h3>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Public Repos</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">{stats?.publicRepos?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stars Received</span>
                    <span className="font-mono font-semibold text-yellow-400 text-sm flex items-center gap-1">
                      <Icon icon="mdi:star" className="text-sm" />
                      {stats?.totalStarsReceived?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Forks Received</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground flex items-center gap-1">
                      <Icon icon="mdi:source-fork" className="text-sm" />
                      {stats?.totalForksReceived?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Repo Health</span>
                    <span className="font-mono font-semibold text-green-400 text-sm">
                      {stats?.repositoryHealth !== undefined ? `${Math.round(stats.repositoryHealth.ratio * 100)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Collaborator Stats */}
            <GlowCard glowColor="purple" customSize className="h-full">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:handshake-outline" className="text-xl text-purple-400" />
                  <h3 className="text-lg font-semibold text-card-foreground">Collaboration</h3>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">PRs Opened</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">{stats?.totalPRsOpened?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">PRs Merged</span>
                    <span className="font-mono font-semibold text-green-400 text-sm">{stats?.totalPRsMerged?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Finisher Ratio</span>
                    <span className="font-mono font-semibold text-blue-400 text-sm">
                      {stats?.finisherRatio ? `${Math.round(stats.finisherRatio * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Code Reviews</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">{stats?.totalReviewsGiven?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Craftsmanship Stats */}
            <GlowCard glowColor="green" customSize className="h-full">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:tools" className="text-xl text-green-400" />
                  <h3 className="text-lg font-semibold text-card-foreground">Craftsmanship</h3>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Commits</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">{stats?.totalCommits?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Languages</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">{stats?.languages?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Issues Closed</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">{stats?.totalIssuesClosed?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Account Age</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">
                      {stats?.createdAt ? 
                        `${Math.floor((Date.now() - new Date(stats.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365))} years` 
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Community Stats */}
            <GlowCard glowColor="orange" customSize className="h-full">
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:account-group-outline" className="text-xl text-orange-400" />
                  <h3 className="text-lg font-semibold text-card-foreground">Community</h3>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Followers</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">{stats?.followers?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Following</span>
                    <span className="font-mono font-semibold text-sm text-card-foreground">{stats?.following?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Top Languages - Orbital Timeline */}
            {stats?.languages && stats.languages.length > 0 && (
              <div className="md:col-span-2">
                <BentoCard title="Top Languages" icon={<Icon icon="mdi:code-tags" />}>
                  <LanguagesOrbitalTimeline languages={stats.languages} />
                </BentoCard>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="text-center space-y-4 pt-8">
        <h3 className="text-xl font-semibold">Share Your Score</h3>
        <div className="text-sm text-muted-foreground">
          Copy this link to share your Gitivity profile:
        </div>
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-muted px-4 py-2 rounded-md font-mono text-sm max-w-md mx-auto">
            {typeof window !== 'undefined' ? window.location.href : `https://gitivity.vercel.app/user/${profile.username}`}
          </div>
          <CopyLinkButton url={typeof window !== 'undefined' ? window.location.href : `https://gitivity.vercel.app/user/${profile.username}`} />
        </div>
      </div>
    </div>
  )
}