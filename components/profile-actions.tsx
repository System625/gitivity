"use client"

import { Icon } from "@iconify/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/stateful-button"
import { cn } from "@/lib/utils"

interface ProfileActionsProps {
  onDownload?: () => Promise<void>
}

export function ProfileActions({ onDownload }: ProfileActionsProps) {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  // Consistent button classes for all actions
  const actionBtnClass =
    "flex min-w-[120px] h-12 items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-border px-5 py-2 font-medium text-foreground transition duration-200 text-base"

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/leaderboard" legacyBehavior passHref>
          <a>
            <button className={actionBtnClass} type="button">
              <Icon icon="mdi:trophy" className="w-5 h-5" />
              <span>Leaderboard</span>
            </button>
          </a>
        </Link>

        <Link href="/" legacyBehavior passHref>
          <a>
            <button className={actionBtnClass} type="button">
              <Icon icon="mdi:magnify" className="w-5 h-5" />
              <span>Analyze</span>
            </button>
          </a>
        </Link>

        <button
          onClick={handleRefresh}
          className={actionBtnClass}
          type="button"
        >
          <Icon icon="mdi:refresh" className="w-5 h-5" />
          <span>Refresh</span>
        </button>

        {onDownload && (
          <Button
            onClick={onDownload}
            className={cn(actionBtnClass, "lg:w-full")}
            type="button"
          >            
            <span>Download</span>
          </Button>
        )}
      </div>
    </div>
  )
}