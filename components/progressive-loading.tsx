"use client"

import { LoaderOne, LoaderTwo, LoaderThree, LoaderFour, LoaderFive } from "@/components/ui/loader"
import { Icon } from "@iconify/react"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface BasicInfo {
  avatarUrl?: string
  name?: string
  followers?: { totalCount: number }
}

interface Contributions {
  totalCommitContributions?: number
}

interface Repositories {
  totalCount: number
}

interface PartialData {
  basic?: {
    basic_info?: BasicInfo
  }
  contributions?: {
    contributions?: Contributions
  }
  repositories?: {
    repositories?: Repositories
  }
}

interface ProgressiveLoadingProps {
  username: string
  progress: number
  currentStep: string
  partialData?: PartialData | null
}

const stepConfig = {
  starting: {
    title: "Starting Analysis",
    description: "Initializing GitHub profile analysis...",
    icon: "mdi:play-circle-outline",
    color: "text-blue-400"
  },
  basic: {
    title: "Loading Profile",
    description: "Fetching basic profile information...",
    icon: "mdi:account-circle-outline",
    color: "text-green-400"
  },
  contributions: {
    title: "Analyzing Contributions",
    description: "Processing commit and contribution data...",
    icon: "mdi:chart-line",
    color: "text-purple-400"
  },
  repositories: {
    title: "Scanning Repositories",
    description: "Analyzing repositories and languages...",
    icon: "mdi:source-repository",
    color: "text-orange-400"
  },
  complete: {
    title: "Calculating Score",
    description: "Finalizing Gitivity score and rankings...",
    icon: "mdi:calculator",
    color: "text-yellow-400"
  },
  error: {
    title: "Analysis Failed",
    description: "An error occurred during analysis",
    icon: "mdi:alert-circle-outline",
    color: "text-red-400"
  }
}

export function ProgressiveLoading({ username, progress, currentStep, partialData }: ProgressiveLoadingProps) {
  const config = stepConfig[currentStep as keyof typeof stepConfig] || stepConfig.starting

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Desktop Layout: Loading Card Left, Progress Right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Loading Card - Left Side */}
        <div className="lg:w-1/2">
          <div className="bg-card rounded-[12px] border border-border shadow-sm p-6 w-full">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
              {/* Main Loading Animation */}
              <div className="text-center flex flex-col justify-center items-center space-y-6">
                <div className="relative">
                  <LoaderThree />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon icon={config.icon} className={`text-3xl ${config.color}`} />
                  </div>
                </div>
                <LoaderFive text={config.title} />
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={config.color}>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {config.description}
                </p>
              </div>

              {/* Analyzing User Info */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  Analyzing @{username}
                </h2>
                {partialData?.basic?.basic_info && (
                  <div className="flex items-center justify-center gap-3 mt-4">
                    {partialData.basic.basic_info.avatarUrl && (
                      <Image
                        src={partialData.basic.basic_info.avatarUrl}
                        alt={username}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full border-2 border-border"
                      />
                    )}
                    <div className="text-left">
                      <div className="font-medium text-foreground">
                        {partialData.basic.basic_info.name || username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {partialData.basic.basic_info.followers?.totalCount} followers
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps - Right Side */}
        <div className="lg:w-1/2">
          <div className="space-y-4">
            {/* Step Indicators */}
            {Object.entries(stepConfig).slice(0, -1).map(([step, stepConf], index) => {
              const isActive = currentStep === step
              const isCompleted = progress > (index * 25)

              return (
                <div
                  key={step}
                  className={`bg-card rounded-[12px] border border-border shadow-sm p-4 transition-all duration-300 ${
                    isActive ? 'ring-2 ring-primary ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : isActive
                        ? `${stepConf.color.replace('text-', 'text-')} bg-current/20`
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <Icon icon="mdi:check" className="text-lg" />
                      ) : isActive ? (
                        <LoaderOne />
                      ) : (
                        <Icon icon={stepConf.icon} className="text-lg" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className={`font-semibold ${
                        isCompleted
                          ? 'text-green-400'
                          : isActive
                          ? stepConf.color
                          : 'text-muted-foreground'
                      }`}>
                        {stepConf.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stepConf.description}
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex-shrink-0">
                        <LoaderTwo />
                      </div>
                    )}
                  </div>

                  {/* Show partial data for completed steps */}
                  {isCompleted && partialData && (
                    <div className="mt-3 pt-3 border-t border-border text-sm">
                      {step === 'basic' && partialData.basic && (
                        <div className="flex justify-between">
                          <span>Profile loaded</span>
                          <span className="text-green-400">✓</span>
                        </div>
                      )}
                      {step === 'contributions' && partialData.contributions && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Commits</span>
                            <span className="text-muted-foreground">
                              {partialData.contributions.contributions?.totalCommitContributions?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                      {step === 'repositories' && partialData.repositories && (
                        <div className="flex justify-between">
                          <span>Repositories</span>
                          <span className="text-muted-foreground">
                            {partialData.repositories.repositories?.totalCount}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Estimated Time */}
      <div className="text-center mt-8">
        <div className="text-sm text-muted-foreground">
          {progress < 100 ? (
            <>
              <LoaderFour text="Analysis in progress..." />
              <p className="mt-2">This usually takes 10-30 seconds</p>
            </>
          ) : (
            <p className="text-green-400">Analysis complete! 🎉</p>
          )}
        </div>
      </div>
    </div>
  )
}