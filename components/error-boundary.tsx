"use client"

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error caught by boundary - could send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card rounded-lg border border-border shadow-sm p-8">
              <div className="text-center space-y-4">
                <Icon
                  icon="mdi:alert-circle-outline"
                  className="text-6xl text-red-400 mx-auto"
                />
                <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
                <p className="text-muted-foreground">
                  An unexpected error occurred while loading this page.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-4 bg-muted rounded-lg text-left">
                    <summary className="cursor-pointer text-sm font-mono">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto">
                      {this.state.error.stack || this.state.error.message}
                    </pre>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2"
                  >
                    <Icon icon="mdi:refresh" className="text-lg" />
                    Retry
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

    return this.props.children
  }
}