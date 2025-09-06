import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Icon } from "@iconify/react"

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
              Most devs score 30-60%. If you&apos;re above 80%, you&apos;re actually good. 
              100%+ means you&apos;ve transcended into the realm of people who ship things that matter.
              The math doesn&apos;t care about your feelings as it&apos;s brutal and fair.
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
                <Icon icon="mdi:star-outline" className="text-2xl text-yellow-400" />
                <CardTitle className="text-2xl font-bold text-white">Creator</CardTitle>
                <span className="text-[#7b3b4b] font-semibold">Do you build shit people want?</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-white/80 space-y-3">
                <p>Can you create something from nothing that doesn&apos;t suck?</p>
                <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-sm">
                  <li><strong>Stars (0-40pts):</strong> log₁₀(stars) × 8. 1K stars = 24pts, 24K stars = 27pts</li>
                  <li><strong>Forks (0-30pts):</strong> log₁₀(forks) × 6. 158K forks = 19pts. Network effect properly weighted</li>
                  <li><strong>Repo Portfolio (0-20pts):</strong> log₁₀(repos) × 10. Quality over quantity</li>
                  <li><strong>Repo Health (0-10pts):</strong> Can you maintain what you build?</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Collaborator Score */}
          <Card className="bg-[#2d314e] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Icon icon="mdi:handshake-outline" className="text-2xl text-purple-400" />
                <CardTitle className="text-2xl font-bold text-white">Collaborator</CardTitle>
                <span className="text-[#7b3b4b] font-semibold">Can humans tolerate working with you?</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-white/80 space-y-3">
                <p>Most important metric. Anyone can code alone.</p>
                <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-sm">
                  <li><strong>Merged PRs (0-50pts):</strong> log₁₀(PRs) × 16. 1K PRs = 32pts. High-volume contributors rewarded</li>
                  <li><strong>Issues Closed (0-20pts):</strong> log₁₀(issues) × 6. Community problem solving</li>
                  <li><strong>Code Reviews (0-20pts):</strong> log₁₀(reviews) × 5. Mentorship scales logarithmically</li>
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
                <Icon icon="mdi:hammer-wrench" className="text-2xl text-green-400" />
                <CardTitle className="text-2xl font-bold text-white">Craftsmanship</CardTitle>
                <span className="text-[#7b3b4b] font-semibold">Grind consistency</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-white/80 space-y-3">
                <p>Programming is a craft. Show your work.</p>
                <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-sm">
                  <li><strong>Commits (0-40pts):</strong> log₁₀(commits) × 8. 100K commits = 40pts. Prolific coders rewarded</li>
                  <li><strong>Languages (0-25pts):</strong> count × 3 + log₁₀(count) × 5. Polyglot bonus scales up</li>
                  <li><strong>Streak (0-20pts):</strong> Linear scaling. 30 day streak = 20pts. Consistency matters</li>
                  <li><strong>Account Age (0-15pts):</strong> log₁₀(years) × 7. 14 years = 14pts. Experience premium</li>
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
                <p className="font-mono">Achievements apply multiplicative bonuses to your base score. Stack them to transcend:</p>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-purple-300"><Icon icon="mdi:trophy-variant" className="inline mr-2" />ELITE TIER (For the 0.1%)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-sm">
                    <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded border border-purple-500/30">
                      <Icon icon="mdi:star-shooting" className="text-2xl text-purple-300" />
                      <div>
                        <div className="font-semibold text-purple-200">Viral Creator × 1.5</div>
                        <div className="text-purple-300/80">10K+ stars. You broke the internet</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded border border-purple-500/30">
                      <Icon icon="mdi:rocket-launch" className="text-2xl text-purple-300" />
                      <div>
                        <div className="font-semibold text-purple-200">Ecosystem Builder × 1.4</div>
                        <div className="text-purple-300/80">50K+ forks. Everyone uses your shit</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded border border-purple-500/30">
                      <Icon icon="mdi:crown" className="text-2xl text-purple-300" />
                      <div>
                        <div className="font-semibold text-purple-200">GitHub Influencer × 1.3</div>
                        <div className="text-purple-300/80">10K+ followers. People listen to you</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-900/20 rounded border border-purple-500/30">
                      <Icon icon="mdi:shield-sword" className="text-2xl text-purple-300" />
                      <div>
                        <div className="font-semibold text-purple-200">GitHub Veteran × 1.2</div>
                        <div className="text-purple-300/80">10+ years. You survived the wars</div>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-green-300 mt-6"><Icon icon="mdi:lightning-bolt" className="inline mr-2" />HIGH TIER (Actually good)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-sm">
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                      <Icon icon="mdi:star-circle" className="text-2xl text-green-300" />
                      <div>
                        <div className="font-semibold text-green-200">Star Creator × 1.25</div>
                        <div className="text-green-300/80">1K+ stars. People don&apos;t hate your code</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                      <Icon icon="mdi:heart-pulse" className="text-2xl text-green-300" />
                      <div>
                        <div className="font-semibold text-green-200">Community Favorite × 1.2</div>
                        <div className="text-green-300/80">1K+ forks. Proven adoption</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                      <Icon icon="mdi:account-group" className="text-2xl text-green-300" />
                      <div>
                        <div className="font-semibold text-green-200">Community Leader × 1.15</div>
                        <div className="text-green-300/80">1K+ followers. Growing influence</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded border border-green-500/30">
                      <Icon icon="mdi:earth" className="text-2xl text-green-300" />
                      <div>
                        <div className="font-semibold text-green-200">Polyglot Master × 1.15</div>
                        <div className="text-green-300/80">10+ languages. Not a one-trick pony</div>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-blue-300 mt-6"><Icon icon="mdi:lightbulb-on" className="inline mr-2" />STANDARD TIER (Baseline competence)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-sm">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <Icon icon="mdi:trending-up" className="text-xl text-blue-300" />
                      <div>
                        <div className="font-semibold text-white">Rising Star × 1.1</div>
                        <div className="text-white/60">100+ stars. Getting there</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <Icon icon="mdi:translate" className="text-xl text-blue-300" />
                      <div>
                        <div className="font-semibold text-white">Polyglot × 1.08</div>
                        <div className="text-white/60">5+ languages. Versatile</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <Icon icon="mdi:chart-line" className="text-xl text-blue-300" />
                      <div>
                        <div className="font-semibold text-white">Consistent × 1.05</div>
                        <div className="text-white/60">30+ day streak. Shows up</div>
                      </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold text-red-400 mb-2">0-30%: Learning</h4>
                  <p>You&apos;re figuring it out. Keep grinding. Everyone starts here.</p>
                </div>
                
                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">30-60%: Competent</h4>
                  <p>You can code and work with others. Congrats, you&apos;re employable.</p>
                </div>
                
                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold text-green-400 mb-2">60-80%: Senior</h4>
                  <p>You ship features, mentor juniors, and maintain legacy code without crying.</p>
                </div>

                <div className="bg-white/5 rounded p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">80-100%: Expert</h4>
                  <p>You build tools other developers depend on. Multiple projects with real impact.</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <p className="text-purple-200">
                  <strong>100-200%: Elite Tier</strong><br />
                  Multiple elite achievements stack. Viral projects, massive adoption, true influence.
                  You&apos;re in Octocat territory. Top 0.1% of developers.
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-400/50">
                <p className="text-purple-100">
                  <strong>200%+: Transcendent</strong><br />
                  Linus Torvalds, DHH, Rich Hickey territory. You don&apos;t just use GitHub, 
                  you&apos;ve fundamentally changed how developers work. Reserved for the gods.
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
              This scoring system is opinionated. Like we said, we don&apos;t care about your feelings. 
              Code speaks louder than conference talks. Shipping beats planning. 
              If you don&apos;t like your score, write better code.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}