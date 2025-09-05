import * as React from "react"
import { cn } from "@/lib/utils"

interface BentoCardProps {
  children: React.ReactNode
  title?: string
  icon?: React.ReactNode
  className?: string
}

export function BentoCard({ children, title, icon, className }: BentoCardProps) {
  return (
    <div
      className={cn(
        "bg-[#2d314e] border border-white/10 rounded-2xl p-6",
        "transition-all duration-200 hover:border-white/20",
        className
      )}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className="text-[#7b3b4b] text-xl">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-white font-semibold text-lg">
              {title}
            </h3>
          )}
        </div>
      )}
      <div className="text-white/80">
        {children}
      </div>
    </div>
  )
}