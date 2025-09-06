import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function CalcLogicPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">How We Judge You</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            GitHub vanity metrics are bullshit. Commit count means nothing. Stars are gamed. 
            We built a system that actually measures if you can ship code and work with humans.
          </p>
        </div>

        {/* Philosophy Section */}
        <Card className="bg-[#2d314e] border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">The Math</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 leading-relaxed">
              Score = (Creator + Collaborator + Craftsmanship) / 3 × ∏ Achievement Multipliers
              <br /><br />
              Most devs score 40-70%. If you&apos;re above 80%, you&apos;re actually good. 
              100%+ means you&apos;ve transcended into the realm of people who ship things that matter.
            </p>
          </CardContent>
        </Card>

        {/* Score Components */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">The Three Pillars</h2>
          
          {/* Creator Score */}
          <Card className="bg-[#2d314e] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <CardTitle className="text-2xl font-bold text-white">Creator</CardTitle>
                <span className="text-[#7b3b4b] font-semibold">Do you build shit people want?</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-white/80 space-y-3">
                <p>Can you create something from nothing that doesn&apos;t suck?</p>
                <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-sm">
                  <li><strong>Stars (0-50pts):</strong> 25+ stars = max. Each star is someone who doesn&apos;t hate your code</li>
                  <li><strong>Repo Portfolio (0-25pts):</strong> Log scale because 1000 toy repos ≠ 10 good ones</li>
                  <li><strong>Forks (0-15pts):</strong> 3+ forks = max. People actually want to use your code</li>
                  <li><strong>Issue Health (0-10pts):</strong> Can you maintain what you build?</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Collaborator Score */}
          <Card className="bg-[#2d314e] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤝</span>
                <CardTitle className="text-2xl font-bold text-white">Collaborator</CardTitle>
                <span className="text-[#7b3b4b] font-semibold">Can humans tolerate working with you?</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-white/80 space-y-3">
                <p>Most important metric. Anyone can code alone.</p>
                <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-sm">
                  <li><strong>Merged PRs (0-60pts):</strong> 200+ merged = max. PRs that don&apos;t get merged are just noise</li>
                  <li><strong>Issues Closed (0-15pts):</strong> 10+ closed = max. Do you actually fix things?</li>
                  <li><strong>Code Reviews (0-15pts):</strong> 15+ reviews = max. Can you mentor without being a dick?</li>
                  <li><strong>Finisher Ratio (0-10pts):</strong> merged/opened ratio. Finishers vs. drive-by contributors</li>
                </ul>
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-yellow-200 font-mono text-sm">
                    <strong>Finisher Ratio:</strong> Low ratio = you open PRs and ghost. High ratio = you see shit through. 
                    The difference between juniors who spam PRs and seniors who ship features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Craftsmanship Score */}
          <Card className="bg-[#2d314e] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛠️</span>
                <CardTitle className="text-2xl font-bold text-white">Craftsmanship</CardTitle>
                <span className="text-[#7b3b4b] font-semibold">Grind consistency</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-white/80 space-y-3">
                <p>Programming is a craft. Show your work.</p>
                <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-sm">
                  <li><strong>Commits (0-50pts):</strong> 1,250+ commits = max. Coding is typing, typing builds muscle memory</li>
                  <li><strong>Languages (0-20pts):</strong> 5+ languages = max. Polyglot {'>'} monoglot. Always.</li>
                  <li><strong>Streak (0-20pts):</strong> 20+ day streak = max. Green squares don&apos;t lie</li>
                  <li><strong>Account Age (0-10pts):</strong> Time in the game. Noobs get docked points</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Achievement Multipliers</h2>
          <Card className="bg-[#2d314e] border-white/10">
            <CardContent>
              <div className="text-white/80 space-y-4">
                <p className="font-mono">Achievements apply multiplicative bonuses to your base score:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                    <span className="text-2xl">🌍</span>
                    <div>
                      <div className="font-semibold text-white">Polyglot × 1.1</div>
                      <div className="text-white/60">3+ languages. One-trick ponies get nothing</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <div className="font-semibold text-white">Mentor × 1.15</div>
                      <div className="text-white/60">10+ reviews. Knowledge hoarding is toxic</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <div className="font-semibold text-white">Consistency × 1.1</div>
                      <div className="text-white/60">10+ day streak. Consistency beats intensity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-semibold text-white">Finisher × 1.0</div>
                      <div className="text-white/60">80%+ PR merge rate. Baseline expectation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <div className="font-semibold text-white">Creator × 1.2</div>
                      <div className="text-white/60">10+ stars. You built something people want</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reality Check */}
        <Card className="bg-red-900/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Reality Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white/80 space-y-4 font-mono text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold text-red-400 mb-2">0-40%: Learning</h4>
                  <p>You&apos;re figuring it out. Keep grinding. Everyone starts here.</p>
                </div>
                
                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">40-70%: Competent</h4>
                  <p>You can code and work with others. Congrats, you&apos;re employable.</p>
                </div>
                
                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold text-green-400 mb-2">70-95%: Senior</h4>
                  <p>You ship features, mentor juniors, and maintain legacy code without crying.</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <p className="text-purple-200">
                  <strong>95%+: Elite Tier</strong><br />
                  You&apos;ve transcended. Multiple achievements stack to push you past 100%. 
                  At this level you&apos;re building tools other developers depend on.
                  150%+ scores are reserved for the Linus Torvalds of the world.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No BS Disclaimer */}
        <Card className="text-center bg-gray-900/50 border-gray-600">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">No Bullshit Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 font-mono text-sm">
              This scoring system is opinionated. We don&apos;t care about your feelings. 
              Code speaks louder than conference talks. Shipping beats planning. 
              If you don&apos;t like your score, write better code.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}