import { UserProfileContainer } from "@/components/user-profile-container"
import { ErrorBoundary } from "@/components/error-boundary"

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  const { username } = await params

  // Generate basic metadata without blocking on data fetching
  return {
    title: `${username} - Gitivity Profile`,
    description: `Check out ${username}'s GitHub activity analysis and Gitivity Score`,
    openGraph: {
      title: `${username} - Gitivity`,
      description: `Analyzing ${username}'s GitHub profile...`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${username} - Gitivity`,
      description: `Analyzing ${username}'s GitHub profile...`,
    }
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params

  // Immediately return container with skeleton - no blocking server calls
  return (
    <ErrorBoundary>
      <UserProfileContainer username={username} />
    </ErrorBoundary>
  )
}