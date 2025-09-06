"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/stateful-button"
import { GridBackground } from "@/components/ui/glowing-card"

export default function Home() {
  const [username, setUsername] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleAnalyze()
  }

  const handleAnalyze = async () => {
    if (username.trim()) {
      // Simulate API call delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push(`/user/${username.trim()}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      <GridBackground
        title="Gitivity"
        description="Discover your GitHub activity score and see how you rank among developers"
        showAvailability={false}
        className="w-full max-w-4xl"
      >
        <div className="mt-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Enter GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <Button type="button" onClick={handleAnalyze}>
                Analyze
              </Button>
            </div>
          </form>

          <div className="text-sm text-muted-foreground">
            <p>
              Get insights into GitHub activity, contribution patterns, and receive a personalized Gitivity Score
            </p>
          </div>
        </div>
      </GridBackground>
    </div>
  )
}
