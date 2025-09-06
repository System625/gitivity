import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"

export function Header() {

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">Gitivity</Link>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/leaderboard" className="text-sm hover:text-primary transition-colors">Leaderboard</Link>
          <Link href="/calc-logic" className="text-sm hover:text-primary transition-colors">How It Works</Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}