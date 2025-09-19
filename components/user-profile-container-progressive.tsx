"use client"

import { useProgressiveProfile } from "@/hooks/use-progressive-profile"
import { UserProfileClient } from "@/components/user-profile-client"
import { ProgressiveLoading } from "@/components/progressive-loading"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { useEffect } from "react"

interface UserProfileContainerProgressiveProps {
  username: string
}

export function UserProfileContainerProgressive({ username }: UserProfileContainerProgressiveProps) {
  const {
    profile,
    stats,
    loading,
    error,
    progress,
    currentStep,
    partialData,
    refetch
  } = useProgressiveProfile(username)

  // Update page metadata once profile is loaded
  useEffect(() => {
    if (profile && stats) {
      // Update document title
      document.title = `${profile.username} - Gitivity Score: ${profile.score}%`

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content',
          `Check out ${profile.username}'s GitHub activity analysis and Gitivity Score of ${profile.score}%`
        )
      }

      // Update Open Graph data
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute('content', `${profile.username} - Gitivity`)
      }

      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content', `Gitivity Score: ${profile.score}%`)
      }
    }
  }, [profile, stats])

  // Show progressive loading while fetching data
  if (loading || (progress < 100 && !error)) {
    return (
      <ProgressiveLoading
        username={username}
        progress={progress}
        currentStep={currentStep}
        partialData={partialData}
      />
    )
  }

  // Handle error states
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-block bg-card border border-border hover:bg-muted rounded-full p-3 shadow-lg transition-colors mb-8"
            aria-label="Go back to homepage"
          >
            <Icon icon="mdi:arrow-left" className="text-xl text-foreground" />
          </Link>

          <div className="bg-card rounded-lg border border-border shadow-sm p-8">
            <div className="text-center space-y-4">
              <Icon
                icon="mdi:alert-circle-outline"
                className="text-6xl text-red-400 mx-auto"
              />
              <h1 className="text-2xl font-bold text-foreground">Profile Analysis Failed</h1>
              <p className="text-muted-foreground">{error}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button
                  onClick={refetch}
                  className="flex items-center gap-2"
                >
                  <Icon icon="mdi:refresh" className="text-lg" />
                  Try Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Icon icon="mdi:home" className="text-lg mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>

              {/* Progress indicator for failed requests */}
              {progress > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Analysis was {progress}% complete when it failed at step: {currentStep}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle case where user doesn't exist (404 error converted to null profile)
  if (!profile || !stats) {
    notFound()
  }

  // Render the full profile once data is loaded
  return <UserProfileClient profile={profile} stats={stats} />
}