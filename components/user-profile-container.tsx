"use client"

import { useUserProfile } from "@/hooks/use-user-profile"
import { UserProfileClient } from "@/components/user-profile-client"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { useEffect } from "react"

// Import the existing loading component
import Loading from "@/app/user/[username]/loading"

interface UserProfileContainerProps {
  username: string
}

export function UserProfileContainer({ username }: UserProfileContainerProps) {
  const { profile, stats, loading, error, refetch } = useUserProfile(username)

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

  // Show loading skeleton while fetching data
  if (loading) {
    return <Loading />
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
              <h1 className="text-2xl font-bold text-foreground">Profile Not Found</h1>
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
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle case where user doesn't exist (show 404 UI for client component)
  // Only show 404 if we've finished loading, have no error, and no data
  if (!loading && error?.includes('not found')) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-card rounded-lg border border-border shadow-sm p-8">
            <div className="text-center space-y-4">
              <Icon
                icon="mdi:account-question-outline"
                className="text-6xl text-muted-foreground mx-auto"
              />
              <h1 className="text-2xl font-bold text-foreground">User Not Found</h1>
              <p className="text-muted-foreground">
                The GitHub user &ldquo;{username}&rdquo; could not be found. Please check the username and try again.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button onClick={refetch} className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render the full profile once data is loaded
  if (!profile || !stats) {
    return null // This shouldn't happen given the loading logic above, but satisfies TypeScript
  }

  return <UserProfileClient profile={profile} stats={stats} />
}