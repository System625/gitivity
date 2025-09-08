import { LoaderOne, LoaderTwo, LoaderThree, LoaderFour, LoaderFive } from "@/components/ui/loader"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Desktop Layout: Loading Card Left, Loading Cards Right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Profile Card - Left Side */}
        <div className="lg:w-1/2">
          <div className="bg-card rounded-[12px] border border-border shadow-sm p-4 w-full">
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
              {/* Main Loading Animation */}
              <div className="text-center space-y-6">
                <LoaderThree />
                <LoaderFive text="Analyzing GitHub Profile..." />
              </div>
              
              {/* Loading Steps */}
              <div className="text-center text-muted-foreground text-sm max-w-md space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <LoaderOne />
                  <span>Fetching profile data</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <LoaderTwo />
                  <span>Calculating scores</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <LoaderOne />
                  <span>Analyzing contributions</span>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="text-center">
                <LoaderFour text="Almost ready!" />
                <p className="text-xs text-muted-foreground mt-2">This may take a few moments...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Right Side */}
        <div className="lg:w-1/2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creator Impact Loading */}
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-4 h-full min-h-[200px]">
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <LoaderOne />
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-400 mb-2">Creator Impact</div>
                  <div className="text-xs text-muted-foreground">Analyzing repositories...</div>
                </div>
              </div>
            </div>

            {/* Collaboration Loading */}
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-4 h-full min-h-[200px]">
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <LoaderTwo />
                <div className="text-center">
                  <div className="text-sm font-semibold text-purple-400 mb-2">Collaboration</div>
                  <div className="text-xs text-muted-foreground">Processing pull requests...</div>
                </div>
              </div>
            </div>

            {/* Craftsmanship Loading */}
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-4 h-full min-h-[200px]">
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <LoaderOne />
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-400 mb-2">Craftsmanship</div>
                  <div className="text-xs text-muted-foreground">Evaluating code quality...</div>
                </div>
              </div>
            </div>

            {/* Community Loading */}
            <div className="bg-card rounded-[12px] border border-border shadow-sm p-4 h-full min-h-[200px]">
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <LoaderTwo />
                <div className="text-center">
                  <div className="text-sm font-semibold text-orange-400 mb-2">Community</div>
                  <div className="text-xs text-muted-foreground">Checking social metrics...</div>
                </div>
              </div>
            </div>

            {/* Top Languages Loading - Full Width */}
            <div className="md:col-span-2 bg-card rounded-[12px] border border-border shadow-sm p-6 min-h-[200px]">
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground mb-4">Top Languages</div>
                  <LoaderFive text="Detecting programming languages..." />
                </div>
                
                {/* Language Detection Simulation */}
                <div className="flex justify-center space-x-6">
                  <div className="text-center">
                    <div className="h-8 w-8 bg-blue-500/20 rounded-full mb-2 flex items-center justify-center">
                      <LoaderOne />
                    </div>
                    <div className="text-xs text-muted-foreground">JavaScript</div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 w-8 bg-orange-500/20 rounded-full mb-2 flex items-center justify-center">
                      <LoaderTwo />
                    </div>
                    <div className="text-xs text-muted-foreground">Python</div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 w-8 bg-purple-500/20 rounded-full mb-2 flex items-center justify-center">
                      <LoaderOne />
                    </div>
                    <div className="text-xs text-muted-foreground">TypeScript</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section Loading */}
      <div className="text-center space-y-6 pt-8">
        <div className="space-y-4">
          <LoaderFour text="Preparing your profile..." />
          <div className="flex justify-center items-center space-x-4">
            <LoaderTwo />
            <span className="text-sm text-muted-foreground">Almost done!</span>
            <LoaderTwo />
          </div>
        </div>
      </div>
    </div>
  )
}