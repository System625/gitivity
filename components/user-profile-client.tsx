"use client"
import { BentoCard } from "@/components/ui/bento-card"
import { GlowCard } from "@/components/spotlight-card"
import { CometCard } from "@/components/ui/comet-card"
import { ProfileActions } from "@/components/profile-actions"
import { LanguagesOrbitalTimeline } from "@/components/ui/languages-orbital-timeline"
import { CopyLinkButton } from "@/components/copy-link-button"
import { Icon } from "@iconify/react"
import Image from "next/image"
import { useState, useRef, useCallback, useEffect } from "react"
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
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Fetch avatar and convert to data URL - more reliable for mobile
  const fetchAvatarAsDataUrl = useCallback(async (imageUrl: string): Promise<string> => {
    const isMobile = isMobileDevice()
    
    try {
      console.log('Fetching avatar directly:', imageUrl, 'Mobile:', isMobile)
      
      // For mobile devices, try multiple approaches
      const fetchUrls = [imageUrl]
      
      // Add proxy approaches for mobile
      if (isMobile && imageUrl.includes('githubusercontent.com')) {
        // Try with different size parameters that might have better CORS
        const baseUrl = imageUrl.split('?')[0]
        fetchUrls.push(`${baseUrl}?s=120&v=4`)
        fetchUrls.push(`${baseUrl}?s=200&v=4`)
      }
      
      let response: Response | null = null
      let usedUrl = ''
      
      // Try each URL
      for (const url of fetchUrls) {
        try {
          console.log('Trying fetch with URL:', url)
          response = await fetch(url, {
            mode: 'cors',
            cache: 'force-cache',
            headers: {
              'Accept': 'image/*'
            }
          })
          
          if (response.ok) {
            usedUrl = url
            break
          }
        } catch (error) {
          console.log('CORS fetch failed for:', url, error)
        }
      }
      
      // If CORS failed, try no-cors as last resort
      if (!response || !response.ok) {
        console.log('All CORS attempts failed, trying no-cors')
        try {
          response = await fetch(imageUrl, {
            mode: 'no-cors',
            cache: 'force-cache'
          })
          usedUrl = imageUrl
        } catch (error) {
          throw new Error(`All fetch attempts failed: ${error}`)
        }
      }
      
      // Convert response to blob
      const blob = await response.blob()
      console.log('Successfully fetched avatar blob from:', usedUrl, 'Size:', blob.size, 'Type:', blob.type)
      
      // For no-cors responses, blob might be empty, check size
      if (blob.size === 0) {
        console.warn('Blob is empty, likely due to no-cors, falling back to canvas')
        throw new Error('Empty blob from no-cors fetch')
      }
      
      // Convert blob to data URL
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          console.log('Successfully converted blob to data URL, length:', dataUrl.length)
          resolve(dataUrl)
        }
        reader.onerror = (error) => {
          console.warn('FileReader failed:', error, 'falling back to canvas approach')
          resolve(convertImageToCanvas(imageUrl))
        }
        reader.readAsDataURL(blob)
      })
      
    } catch (error) {
      console.warn('All fetch approaches failed:', error, 'falling back to canvas')
      return convertImageToCanvas(imageUrl)
    }
  }, [isMobileDevice, convertImageToCanvas])

  // Fallback canvas conversion method
  const convertImageToCanvas = useCallback((imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new (window.Image)()
      
      // Set crossOrigin before setting src
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            console.warn('Failed to get canvas context')
            resolve(imageUrl)
            return
          }
          
          // Set canvas dimensions to match image
          canvas.width = img.naturalWidth || img.width
          canvas.height = img.naturalHeight || img.height
          
          // Draw the image to canvas
          ctx.drawImage(img, 0, 0)
          
          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/png', 1.0)
          console.log('Canvas conversion successful')
          resolve(dataUrl)
        } catch (error) {
          console.warn('Canvas conversion failed:', error)
          resolve(imageUrl)
        }
      }
      
      img.onerror = () => {
        console.warn('Image load failed, using original URL')
        resolve(imageUrl)
      }
      
      // Add timeout
      setTimeout(() => {
        console.warn('Canvas conversion timed out')
        resolve(imageUrl)
      }, 10000)
      
      img.src = imageUrl
    })
  }, [])
  
  // Preload avatar as data URL on component mount (mobile optimization)
  useEffect(() => {
    if (profile.avatarUrl) {
      fetchAvatarAsDataUrl(profile.avatarUrl).then(setAvatarDataUrl)
    }
  }, [profile.avatarUrl, fetchAvatarAsDataUrl])
  
  // Mobile detection utility
  const isMobileDevice = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    // Check for mobile user agents
    const userAgent = navigator.userAgent
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent)
    
    // Check for mobile screen size
    const isMobileScreen = window.innerWidth <= 768
    
    // Check for touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    return isMobileUA || (isMobileScreen && isTouchDevice)
  }, [])
  
  // Dynamic configuration based on device
  const getDownloadConfig = () => {
    const isMobile = isMobileDevice()
    const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    
    return {
      pixelRatio: isMobile ? Math.max(devicePixelRatio, 3) : 2,
      canvasWidth: isMobile ? 450 : 550,
      canvasHeight: isMobile ? 900 : 600,
      isMobile
    }
  }

  const [, convertToPng, cardRefCallback] = useToPng<HTMLDivElement>({
    // Keep this hook simple: only handle success and error.
    // All preparation logic is now in downloadCard.
    onSuccess: (data) => {
      const link = document.createElement('a');
      link.download = `${profile.username}-gitivity-profile.png`;
      link.href = data;
      link.click();
      setIsStatic(false); // Clean up after success
    },
    onError: (error) => {
      console.error('Error downloading card:', error);
      alert('Failed to download the card. Please try again.');
      setIsStatic(false); // Clean up after error
    },
    // Keep the rest of your configuration
    backgroundColor: undefined,
    pixelRatio: getDownloadConfig().pixelRatio,
    style: {
      borderRadius: '12px',
      overflow: 'hidden'
    },
    filter: () => true,
    includeQueryParams: true,
    skipAutoScale: false,
    canvasWidth: getDownloadConfig().canvasWidth,
    canvasHeight: getDownloadConfig().canvasHeight
  });

  // THIS FUNCTION CONTAINS THE FINAL FIX
  const downloadCard = async () => {
    try {
      // Step 1: Prepare the avatar Data URL if it's not already available.
      let currentAvatarDataUrl = avatarDataUrl;
      if (!currentAvatarDataUrl && profile.avatarUrl) {
        console.log('Avatar data URL not found, fetching now...');
        currentAvatarDataUrl = await fetchAvatarAsDataUrl(profile.avatarUrl);
        setAvatarDataUrl(currentAvatarDataUrl);
      }

      // Step 2: Set the component to "static" mode to render the <img> tag.
      console.log('Setting component to static mode for capture...');
      setIsStatic(true);

      // Step 3: Wait for React to re-render the DOM with the static content.
      // A minimal timeout allows the DOM update to process.
      await new Promise(resolve => setTimeout(resolve, 50));

      // Step 4: CRITICAL - Find the new <img> element and wait for it to fully load.
      // This is the most reliable way to ensure the image is ready for capture.
      if (cardRef.current) {
        const avatarImg = cardRef.current.querySelector('img');
        // The 'complete' property is true if the browser has finished loading the image.
        if (avatarImg && !avatarImg.complete) {
          console.log('Avatar image is not yet complete. Waiting for onload...');
          await new Promise(resolve => {
            avatarImg.onload = resolve;
            // Also resolve on error to prevent the process from hanging indefinitely.
            avatarImg.onerror = (err) => {
              console.error("Avatar image failed to load its data URL source.", err);
              resolve(null); 
            };
          });
          console.log('Avatar onload event fired. Image is ready.');
        } else {
            console.log('Avatar image was already complete or not found.')
        }
      }
      
      // Step 5: Add a final "paint" delay, especially for mobile devices.
      // This gives the browser an extra moment to draw the loaded image.
      const finalPaintDelay = isMobileDevice() ? 400 : 100;
      console.log(`Applying final paint delay of ${finalPaintDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, finalPaintDelay));

      // Step 6: With everything prepared and rendered, trigger the capture.
      console.log('All preparations complete. Starting PNG conversion...');
      await convertToPng();

    } catch (error) {
      console.error("An error occurred during the download preparation:", error);
      alert("Something went wrong while preparing the download. Please try again.");
      setIsStatic(false); // Ensure we clean up state on failure
    }
  };

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
                    isStatic ? (
                      <img
                        src={avatarDataUrl || profile.avatarUrl}
                        alt={profile.username}
                        width={60}
                        height={60}
                        className="w-15 h-15 rounded-full border-2 border-[#7b3b4b]"
                        style={{ 
                          width: '60px', 
                          height: '60px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        crossOrigin="anonymous"
                        loading="eager"
                      />
                    ) : (
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.username}
                        width={60}
                        height={60}
                        priority
                        className="w-15 h-15 rounded-full border-2 border-[#7b3b4b]"
                      />
                    )
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