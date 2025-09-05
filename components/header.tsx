import { auth } from "@/auth"
import { LoginButton, LogoutButton } from "@/components/auth-components"
import Link from "next/link"
import Image from "next/image"

export async function Header() {
  const session = await auth()

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">Gitivity</Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/leaderboard" className="text-sm hover:text-primary transition-colors">Leaderboard</Link>
            <Link href="/calc-logic" className="text-sm hover:text-primary transition-colors">How It Works</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">
                  {session.user?.name}
                </span>
              </div>
              <LogoutButton />
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  )
}