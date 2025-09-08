import { LoaderOne, LoaderTwo, LoaderThree, LoaderFour, LoaderFive } from "@/components/ui/loader"
import { Icon } from "@iconify/react"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Loading */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <LoaderThree />
          <div className="space-y-2">
            <LoaderFive text="Loading Leaderboard..." />
            <div className="flex items-center justify-center space-x-2">
              <LoaderOne />
              <span className="text-sm text-muted-foreground">Ranking developers worldwide</span>
              <LoaderOne />
            </div>
          </div>
          <LoaderThree />
        </div>
      </div>

      {/* Top 3 Podium Loading */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <LoaderFour text="Top Performers" />
        </div>
        
        <div className="flex justify-center items-end space-x-8 mb-8">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-6 mb-4 w-32 h-40 flex flex-col items-center justify-center">
              <div className="text-6xl mb-2"><Icon icon="emojione:2nd-place-medal" /></div>
              <LoaderTwo />
              <div className="text-xs text-muted-foreground mt-2">#2</div>
            </div>
            <div className="h-16 bg-gradient-to-t from-silver-500/20 to-silver-400/20 rounded-t-lg"></div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-6 mb-4 w-36 h-48 flex flex-col items-center justify-center">
              <div className="text-7xl mb-2"><Icon icon="noto:trophy" /></div>
              <LoaderThree />
              <div className="text-xs text-muted-foreground mt-2">#1</div>
            </div>
            <div className="h-24 bg-gradient-to-t from-yellow-500/20 to-yellow-400/20 rounded-t-lg"></div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-6 mb-4 w-32 h-36 flex flex-col items-center justify-center">
              <div className="text-5xl mb-2"><Icon icon="emojione:3rd-place-medal" /></div>
              <LoaderOne />
              <div className="text-xs text-muted-foreground mt-2">#3</div>
            </div>
            <div className="h-12 bg-gradient-to-t from-amber-600/20 to-amber-500/20 rounded-t-lg"></div>
          </div>
        </div>
      </div>

      {/* Leaderboard List Loading */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <LoaderFive text="Loading all rankings..." />
          <div className="flex justify-center items-center space-x-4 mt-4">
            <LoaderTwo />
            <span className="text-sm text-muted-foreground">Fetching top developers</span>
            <LoaderTwo />
          </div>
        </div>

        {/* Mock Leaderboard Rows */}
        <div className="space-y-4">
          {[4, 5, 6, 7, 8, 9, 10].map((rank, index) => (
            <div
              key={rank}
              className="bg-card rounded-[12px] border border-border shadow-sm p-4 flex items-center justify-between"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="text-2xl font-bold text-muted-foreground w-12 text-center">
                  #{rank}
                </div>
                
                {/* Avatar Loading */}
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <LoaderOne />
                </div>
                
                {/* User Info Loading */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    <LoaderTwo />
                  </div>
                  <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Score Loading */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                  <LoaderOne />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Loading score...</div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Loading */}
        <div className="text-center mt-12 space-y-4">
          <LoaderFour text="Loading more developers..." />
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <LoaderTwo />
              <span className="text-xs text-muted-foreground">Analyzing profiles</span>
            </div>
            <div className="flex items-center space-x-2">
              <LoaderOne />
              <span className="text-xs text-muted-foreground">Calculating ranks</span>
            </div>
            <div className="flex items-center space-x-2">
              <LoaderTwo />
              <span className="text-xs text-muted-foreground">Updating scores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fun Stats Loading */}
      <div className="mt-16 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <LoaderThree />
            <div className="text-sm font-semibold">Total Developers</div>
            <LoaderFive text="Counting..." />
          </div>
          
          <div className="space-y-4">
            <LoaderThree />
            <div className="text-sm font-semibold">Average Score</div>
            <LoaderFive text="Calculating..." />
          </div>
          
          <div className="space-y-4">
            <LoaderThree />
            <div className="text-sm font-semibold">Last Updated</div>
            <LoaderFive text="Refreshing..." />
          </div>
        </div>
      </div>

      {/* Bottom Motivational Section */}
      <div className="text-center mt-16 space-y-6">
        <LoaderFour text="Get ready to see where you rank!" />
        <div className="flex justify-center items-center space-x-4">
          <LoaderOne />
          <span className="text-sm text-muted-foreground">Almost there...</span>
          <LoaderOne />
        </div>
      </div>
    </div>
  )
}