"use client"

import { ProfileCardForDownload } from "@/components/profile-card-for-download"
import { UserProfileClient } from "@/components/user-profile-client"
import { GitivityStats } from "@/lib/analysis"

// Mock data for testing
const mockProfile = {
  username: "system625",
  score: 47,
  avatarUrl: "https://avatars.githubusercontent.com/u/1234567?v=4", // Using a GitHub avatar
  rank: 3,
  totalUsers: 4
}

const mockStats: GitivityStats = {
  name: "Olamiposi",
  bio: "I add paddings and stuff.",
  publicRepos: 25,
  totalStarsReceived: 150,
  totalForksReceived: 30,
  totalCommits: 450,
  totalPRsOpened: 75,
  totalPRsMerged: 68,
  totalIssuesOpened: 10,
  totalReviewsGiven: 25,
  totalIssuesClosed: 35,
  followers: 120,
  following: 80,
  createdAt: "2020-01-15T08:00:00Z",
  lastUpdated: "2024-01-15T08:00:00Z",
  contributionStreak: { current: 15, longest: 30 },
  languages: [
    { name: "TypeScript", percentage: 35 },
    { name: "JavaScript", percentage: 25 },
    { name: "Python", percentage: 20 },
    { name: "CSS", percentage: 12 },
    { name: "HTML", percentage: 8 }
  ],
  repositoryHealth: {
    openIssues: 5,
    closedIssues: 20,
    ratio: 0.85
  },
  finisherRatio: 0.91,
  scoreBreakdown: {
    total: 47,
    creatorScore: 25,
    collaboratorScore: 38,
    craftsmanshipScore: 57,
    achievements: [
      {
        id: "polyglot",
        name: "Polyglot",
        description: "Proficient in 5 languages",
        icon: "⭐",
        earned: true
      },
      {
        id: "collaborator",
        name: "Team Player",
        description: "Excellent collaboration",
        icon: "🤝",
        earned: true
      },
      {
        id: "creator",
        name: "Creator",
        description: "High-quality repos",
        icon: "🚀",
        earned: true
      }
    ],
    multipliers: [
      { name: "Polyglot", value: 1.08 },
      { name: "Team Player", value: 1.05 },
      { name: "Creator", value: 1.08 }
    ]
  }
}

export default function TestDownloadPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Download Preview</h1>
          <p className="text-muted-foreground">
            This is exactly what will be downloaded as PNG
          </p>
        </div>

        {/* Download Component Preview */}
        <div className="flex justify-center">
          <ProfileCardForDownload profile={mockProfile} stats={mockStats} />
        </div>

        {/* Debug Info */}
        <div className="bg-card p-4 rounded-lg border text-center">
          <h3 className="text-lg font-semibold mb-2">Preview Details</h3>
          <div className="text-sm space-y-1 font-mono">
            <p>Fixed Width: 550px | Dark Theme | Clean Layout</p>
            <p>Avatar URL: {mockProfile.avatarUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}