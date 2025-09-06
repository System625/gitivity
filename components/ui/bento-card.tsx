import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "./card"

interface BentoCardProps {
  children: React.ReactNode
  title?: string
  icon?: React.ReactNode
  className?: string
}

export function BentoCard({ children, title, icon, className }: BentoCardProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border rounded-2xl",
        "transition-all duration-200 hover:border-border/80",
        className
      )}
    >
      {(title || icon) && (
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-primary text-xl">
                {icon}
              </div>
            )}
            {title && (
              <CardTitle className="text-card-foreground font-semibold text-lg">
                {title}
              </CardTitle>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="text-card-foreground/80">
        {children}
      </CardContent>
    </Card>
  )
}