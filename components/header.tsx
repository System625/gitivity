import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/theme-toggle"

export function Header() {

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/gitivity.png" 
              alt="Gitivity Logo" 
              width={36} 
              height={36}              
            />
            <span className="hidden md:block text-xl font-bold">Gitivity</span>
          </Link>
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