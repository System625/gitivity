import { useState, useEffect, useRef } from 'react'
import { type GitivityProfile, type GitivityStats } from '@/lib/analysis'

interface UseUserProfileReturn {
  profile: GitivityProfile | null
  stats: GitivityStats | null
  loading: boolean
  error: string | null
  refetch: () => void
  isStale: boolean
  isRevalidating: boolean
}

interface GitivityProfileResponse extends Omit<GitivityProfile, 'stats'> {
  stats: GitivityStats
}

export function useUserProfile(username: string, autoFetch = true): UseUserProfileReturn {
  const [profile, setProfile] = useState<GitivityProfile | null>(null)
  const [stats, setStats] = useState<GitivityStats | null>(null)
  const [loading, setLoading] = useState(autoFetch && !!username)
  const [error, setError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [isRevalidating, setIsRevalidating] = useState(false)

  const staleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const revalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchProfile = async (isBackground = false) => {
    if (!username) return

    if (!isBackground) {
      setLoading(true)
    } else {
      setIsRevalidating(true)
    }

    setError(null)

    try {
      const response = await fetch(`/api/user/${encodeURIComponent(username)}`, {
        // Add cache-busting for background revalidation
        ...(isBackground && {
          headers: { 'Cache-Control': 'no-cache' }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 404) {
          throw new Error(`GitHub user "${username}" not found. Please check the username and try again.`)
        }

        if (response.status === 429) {
          throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.')
        }

        throw new Error(errorData.error || `Failed to fetch profile (${response.status})`)
      }

      const data: GitivityProfileResponse = await response.json()

      // Convert the response to match our expected types
      const profileData: GitivityProfile = {
        ...data,
        stats: data.stats as unknown as GitivityProfile['stats']
      }

      setProfile(profileData)
      setStats(data.stats)
      setError(null)
      setIsStale(false)

      // Set up stale-while-revalidate timers
      if (staleTimeoutRef.current) {
        clearTimeout(staleTimeoutRef.current)
      }
      if (revalidateTimeoutRef.current) {
        clearTimeout(revalidateTimeoutRef.current)
      }

      // Mark as stale after 30 minutes
      staleTimeoutRef.current = setTimeout(() => {
        setIsStale(true)
      }, 30 * 60 * 1000)

      // Auto-revalidate after 1 hour
      revalidateTimeoutRef.current = setTimeout(() => {
        if (username) {
          fetchProfile(true) // Background revalidation
        }
      }, 60 * 60 * 1000)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)

      // Only clear data if this is not a background revalidation
      if (!isBackground) {
        setProfile(null)
        setStats(null)
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
      } else {
        setIsRevalidating(false)
      }
    }
  }

  const refetch = () => {
    fetchProfile(false)
  }

  useEffect(() => {
    if (autoFetch && username) {
      fetchProfile(false)
    }

    // Cleanup timers on unmount
    return () => {
      if (staleTimeoutRef.current) {
        clearTimeout(staleTimeoutRef.current)
      }
      if (revalidateTimeoutRef.current) {
        clearTimeout(revalidateTimeoutRef.current)
      }
    }
  }, [username, autoFetch]) // fetchProfile is defined inline and doesn't need to be in deps

  return {
    profile,
    stats,
    loading,
    error,
    refetch,
    isStale,
    isRevalidating
  }
}