"use client"

import { Icon } from "@iconify/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ProfileActions() {
  const router = useRouter()


  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/leaderboard">
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-border px-4 py-2 font-medium text-foreground transition duration-200">
            <Icon icon="mdi:trophy" className="w-4 h-4" />
            Leaderboard
          </button>
        </Link>
        
        <Link href="/">
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-border px-4 py-2 font-medium text-foreground transition duration-200">
            <Icon icon="mdi:magnify" className="w-4 h-4" />
            Analyze
          </button>
        </Link>
        
        <button 
          onClick={handleRefresh}
          className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-border px-4 py-2 font-medium text-foreground transition duration-200"
        >
          <Icon icon="mdi:refresh" className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  )
}