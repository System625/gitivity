import { notFound } from "next/navigation"
import { analyzeUser, type GitivityStats } from "@/lib/analysis"
import { UserProfileClient } from "@/components/user-profile-client"

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  const { username } = await params
  const profile = await analyzeUser(username)
  
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
  const { username } = await params
  const profile = await analyzeUser(username)

  if (!profile) {
    notFound()
  }

  const stats = profile.stats as unknown as GitivityStats

  return <UserProfileClient profile={profile} stats={stats} />
}