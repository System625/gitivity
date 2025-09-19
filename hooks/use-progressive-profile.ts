import { useState, useEffect, useRef } from 'react'
import { type GitivityProfile, type GitivityStats } from '@/lib/analysis'

interface ProgressiveStep {
  step: 'basic' | 'contributions' | 'repositories' | 'issues' | 'complete' | 'error'
  progress: number
  data: Record<string, unknown>
  error?: string
}

interface UseProgressiveProfileReturn {
  profile: GitivityProfile | null
  stats: GitivityStats | null
  loading: boolean
  error: string | null
  progress: number
  currentStep: string
  partialData: Record<string, unknown> | null
  refetch: () => void
}

export function useProgressiveProfile(username: string, autoFetch = true): UseProgressiveProfileReturn {
  const [profile, setProfile] = useState<GitivityProfile | null>(null)
  const [stats, setStats] = useState<GitivityStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('idle')
  const [partialData, setPartialData] = useState<Record<string, unknown> | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchProgressiveProfile = async () => {
    if (!username) return

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    setLoading(true)
    setError(null)
    setProgress(0)
    setCurrentStep('starting')

    try {
      // Step 1: Check for existing data
      const initialResponse = await fetch(
        `/api/user/${encodeURIComponent(username)}/progressive`,
        { signal }
      )

      if (!initialResponse.ok) {
        throw new Error(`Failed to start progressive loading: ${initialResponse.status}`)
      }

      const initialData: ProgressiveStep = await initialResponse.json()

      if (initialData.step === 'complete') {
        // Data is already complete
        const profileData = initialData.data as unknown as GitivityProfile
        setProfile(profileData)
        setStats(profileData.stats as unknown as GitivityStats)
        setProgress(100)
        setCurrentStep('complete')
        setLoading(false)
        return
      }

      // Step 2: Progressive loading for fresh data
      const steps = ['basic', 'contributions', 'repositories', 'complete']

      for (const step of steps) {
        if (signal.aborted) return

        setCurrentStep(step)

        const stepResponse = await fetch(
          `/api/user/${encodeURIComponent(username)}/progressive`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step }),
            signal
          }
        )

        if (!stepResponse.ok) {
          throw new Error(`Step ${step} failed: ${stepResponse.status}`)
        }

        const stepData: ProgressiveStep = await stepResponse.json()

        if (stepData.error) {
          throw new Error(stepData.error)
        }

        setProgress(stepData.progress)
        setPartialData(prev => ({ ...prev, [step]: stepData.data }))

        // Add small delay for UX (shows progress)
        if (step !== 'complete') {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      // Step 3: Get final complete profile
      const finalResponse = await fetch(
        `/api/user/${encodeURIComponent(username)}`,
        { signal }
      )

      if (!finalResponse.ok) {
        if (finalResponse.status === 404) {
          throw new Error(`GitHub user "${username}" not found. Please check the username and try again.`)
        }
        throw new Error(`Failed to fetch final profile: ${finalResponse.status}`)
      }

      const finalData = await finalResponse.json()

      const profileData: GitivityProfile = {
        ...finalData,
        stats: finalData.stats as unknown as GitivityProfile['stats']
      }

      setProfile(profileData)
      setStats(finalData.stats)
      setProgress(100)
      setCurrentStep('complete')
      setError(null)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled
      }

      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setProfile(null)
      setStats(null)
      setProgress(0)
      setCurrentStep('error')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchProgressiveProfile()
  }

  useEffect(() => {
    if (autoFetch && username) {
      fetchProgressiveProfile()
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [username, autoFetch, fetchProgressiveProfile])

  return {
    profile,
    stats,
    loading,
    error,
    progress,
    currentStep,
    partialData,
    refetch
  }
}