"use client"
import { BentoCard } from "@/components/ui/bento-card"
import { GlowCard } from "@/components/spotlight-card"
import { CometCard } from "@/components/ui/comet-card"
import { ProfileActions } from "@/components/profile-actions"
import { LanguagesOrbitalTimeline } from "@/components/ui/languages-orbital-timeline"
import { CopyLinkButton } from "@/components/copy-link-button"
import { Icon } from "@iconify/react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import html2canvas from "html2canvas"
import { ProfileCardForDownload } from "@/components/profile-card-for-download"
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
  const [isPreparingDownload, setIsPreparingDownload] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')
  const downloadCardRef = useRef<HTMLDivElement>(null)

  // This effect will run AFTER the component re-renders with isPreparingDownload = true
  useEffect(() => {
    console.log('useEffect triggered, isPreparingDownload:', isPreparingDownload)
    // Only proceed if we are in the "preparing" state and the ref is attached
    if (isPreparingDownload && downloadCardRef.current) {
      console.log('Download card ref found, starting download process')
      const cardElement = downloadCardRef.current

      const performDownload = async () => {
        // Much shorter wait time - just enough for DOM updates
        await new Promise(resolve => setTimeout(resolve, 300))
        console.log('Generating canvas...')
        generateCanvas(cardElement)
      }

      performDownload()
    }
  }, [isPreparingDownload]) // The key: this effect depends on the state change

  const generateCanvas = async (element: HTMLElement) => {
    if (!element) return

    try {
      // First, ensure all images in the original DOM are loaded
      const originalImages = element.querySelectorAll('img')
      const originalImagePromises = Array.from(originalImages).map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            // Image is already loaded
            resolve()
          } else {
            const timeout = setTimeout(() => {
              console.warn('Original image load timeout for:', img.src)
              resolve()
            }, 3000)
            
            img.onload = () => {
              clearTimeout(timeout)
              resolve()
            }
            img.onerror = () => {
              clearTimeout(timeout)
              console.warn('Original image failed to load:', img.src)
              resolve()
            }
          }
        })
      })
      
      console.log(`Waiting for ${originalImagePromises.length} original images to load...`)
      setDownloadProgress('Loading images...')
      await Promise.allSettled(originalImagePromises)
      console.log('Original images loaded')
      setDownloadProgress('Preparing download...')
      
      // Additional wait time for mobile devices
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(element, {
        backgroundColor: '#0d1117',
        scale: 1.2,
        useCORS: false, // We're handling images manually now
        allowTaint: false, // Safer approach
        logging: false,
        foreignObjectRendering: false,
        imageTimeout: 10000,
        removeContainer: false,
        ignoreElements: (element) => {
          // Ignore all style and link elements
          return element.tagName === 'STYLE' || element.tagName === 'LINK' || element.tagName === 'SCRIPT'
        },
        onclone: async (clonedDoc) => {
          console.log('Cloning document and removing all external CSS...')
          
          // Remove ALL stylesheets to prevent lab() color parsing
          const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style')
          stylesheets.forEach(sheet => {
            console.log('Removing stylesheet:', sheet)
            sheet.remove()
          })
          
          // Remove any remaining style tags
          const remainingStyles = clonedDoc.querySelectorAll('*[style*="lab"]')
          remainingStyles.forEach(el => {
            console.log('Found element with lab() color:', el)
            // Clear any computed styles that might contain lab()
            if (el instanceof HTMLElement) {
              el.style.cssText = ''
            }
          })

          // Convert all images to data URLs to avoid CORS issues
          const images = clonedDoc.querySelectorAll('img')
          const imagePromises = Array.from(images).map(async (img) => {
            try {
              // If the image is already a data URL, skip processing
              if (img.src.startsWith('data:')) {
                console.log('Image is already a data URL, skipping conversion')
                return Promise.resolve()
              }
              
              // Create a new image element to load the image
              const tempImg = document.createElement('img')
              tempImg.crossOrigin = 'anonymous'
              
              return new Promise<void>((resolve) => {
                // Set a longer timeout for mobile devices
                const timeout = setTimeout(() => {
                  console.warn('Image processing timeout for:', img.src)
                  resolve()
                }, 8000) // 8 second timeout for mobile
                
                tempImg.onload = () => {
                  clearTimeout(timeout)
                  try {
                    // Create a canvas to convert the image to data URL
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')
                    if (ctx && tempImg.width > 0 && tempImg.height > 0) {
                      canvas.width = tempImg.width
                      canvas.height = tempImg.height
                      ctx.drawImage(tempImg, 0, 0)
                      const dataUrl = canvas.toDataURL('image/png')
                      img.src = dataUrl
                      console.log('Successfully converted image to data URL:', img.src.substring(0, 50) + '...')
                    } else {
                      console.warn('Invalid image dimensions or context:', tempImg.width, tempImg.height)
                    }
                    resolve()
                  } catch (error) {
                    console.warn('Failed to convert image to data URL:', error)
                    resolve()
                  }
                }
                tempImg.onerror = () => {
                  clearTimeout(timeout)
                  console.warn('Failed to load image:', img.src)
                  resolve()
                }
                
                // Add a small delay before setting src to ensure proper loading
                setTimeout(() => {
                  tempImg.src = img.src
                }, 100)
              })
            } catch (error) {
              console.warn('Error processing image:', error)
              return Promise.resolve()
            }
          })
          
          // Wait for all images to be processed with a timeout
          console.log(`Processing ${imagePromises.length} images...`)
          setDownloadProgress('Processing images...')
          await Promise.allSettled(imagePromises)
          console.log('Image processing complete')
          setDownloadProgress('Generating image...')
          
          console.log('CSS cleanup complete')
        }
      })

      // Convert canvas to image data URL
      setDownloadProgress('Finalizing...')
      const dataUrl = canvas.toDataURL('image/png')
      
      // Trigger download
      const link = document.createElement('a')
      link.download = `${profile.username}-gitivity-profile.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('Download triggered')
      setDownloadProgress('Download complete!')

    } catch (error) {
      console.error('Failed to capture card as image:', error)
      alert('Could not capture the card as an image.')
    } finally {
      setIsPreparingDownload(false)
      setIsDownloading(false)
      setDownloadProgress('')
    }
  }

  // This is the function called by the button
  const handleDownloadClick = async (): Promise<void> => {
    if (isDownloading) return // Prevent multiple clicks
    console.log('Download button clicked')
    setIsDownloading(true)
    setIsPreparingDownload(true) // This kicks off the useEffect hook
  }

  return (
    <div className="container mx-auto px-4 py-6">
      
      {/* Hidden component for download */}
      {isPreparingDownload && (
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1, pointerEvents: 'none' }}>
          <ProfileCardForDownload ref={downloadCardRef} profile={profile} stats={stats} />
        </div>
      )}
      
      {/* Desktop Layout: Comet Card Left, Stats Cards Right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Profile Card - Left Side */}
        <div className="lg:w-1/2">
          <CometCard className="comet-card-container" isStatic={isStatic}>
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-4 w-full">
              <div className="bg-card rounded-[12px] border border-border shadow-sm p-4">
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
                        priority // Eagerly load the avatar
                        crossOrigin="anonymous" // Essential for canvas operations
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
                      <div className="text-2xl md:text-4xl font-bold text-[#7b3b4b] mt-1">
                        Rank #{profile.rank.toLocaleString()} out of {profile.totalUsers.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {stats?.bio && (
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto line-clamp-2">Bio: {stats.bio}</p>
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
                        <div className="text-foreground font-semibold text-[10px] md:text-xs mb-1">Creator</div>
                        <div className="text-muted-foreground text-[10px] md:text-xs">Personal impact</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Icon icon="mdi:handshake-outline" className="text-xl text-[#7b3b4b]" />
                        </div>
                        <div className="text-lg font-bold text-[#7b3b4b] mb-1">
                          {stats.scoreBreakdown.collaboratorScore}
                        </div>
                        <div className="text-foreground font-semibold text-[10px] md:text-xs mb-1">Collaborator</div>
                        <div className="text-muted-foreground text-[10px] md:text-xs">Open source</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Icon icon="mdi:tools" className="text-xl text-[#7b3b4b]" />
                        </div>
                        <div className="text-lg font-bold text-[#7b3b4b] mb-1">
                          {stats.scoreBreakdown.craftsmanshipScore}
                        </div>
                        <div className="text-foreground font-semibold text-[10px] md:text-xs mb-1">Craftsmanship</div>
                        <div className="text-muted-foreground text-[10px] md:text-xs">Quality</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {stats?.scoreBreakdown?.achievements && stats.scoreBreakdown.achievements.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h2 className="text-lg font-bold text-center mb-3 text-foreground">Achievements</h2>
                    <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm md:max-w-none mx-auto">
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
                          <div key={achievement.id} className="bg-white/5 rounded-lg border border-white/10 p-2 md:p-3 text-center w-[130px] md:w-[140px] flex-shrink-0">
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

              {/* Download Progress */}
              {isDownloading && downloadProgress && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    {downloadProgress}
                  </div>
                </div>
              )}

              {/* Profile Actions */}
              <ProfileActions onDownload={handleDownloadClick} />
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
          <div className="bg-muted px-4 py-2 rounded-md font-mono text-sm">
            {typeof window !== 'undefined' ? window.location.href : `https://gitivity.vercel.app/user/${profile.username}`}
          </div>
          <CopyLinkButton url={typeof window !== 'undefined' ? window.location.href : `https://gitivity.vercel.app/user/${profile.username}`} />
        </div>
      </div>
    </div>
  )
}