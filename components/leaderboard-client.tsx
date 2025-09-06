"use client";

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LinkPreview } from "@/components/ui/link-preview"
import { Button as StatefulButton } from "@/components/ui/stateful-button"
import { Icon } from "@iconify/react"
import Image from "next/image"
import { type GitivityStats } from "@/lib/analysis"
import { type JsonValue } from "@prisma/client/runtime/library"

interface LeaderboardProfile {
  username: string;
  score: number;
  avatarUrl: string | null;
  stats: JsonValue;
  updatedAt: Date;
}

interface LeaderboardClientProps {
  initialProfiles: LeaderboardProfile[];
}

export function LeaderboardClient({ initialProfiles }: LeaderboardClientProps) {
  const [profiles] = useState<LeaderboardProfile[]>(initialProfiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<'score' | 'repos' | 'stars' | 'followers'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filteredProfiles, setFilteredProfiles] = useState<LeaderboardProfile[]>(initialProfiles)

  useEffect(() => {
    let filtered = profiles
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'score':
          aValue = a.score
          bValue = b.score
          break
        case 'repos':
          aValue = (a.stats as unknown as GitivityStats)?.publicRepos || 0
          bValue = (b.stats as unknown as GitivityStats)?.publicRepos || 0
          break
        case 'stars':
          aValue = (a.stats as unknown as GitivityStats)?.totalStarsReceived || 0
          bValue = (b.stats as unknown as GitivityStats)?.totalStarsReceived || 0
          break
        case 'followers':
          aValue = (a.stats as unknown as GitivityStats)?.followers || 0
          bValue = (b.stats as unknown as GitivityStats)?.followers || 0
          break
        default:
          aValue = a.score
          bValue = b.score
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })
    
    setFilteredProfiles(filtered)
  }, [profiles, searchTerm, sortBy, sortOrder])

  // const handleSearch = async () => {
  //   // Simulate search delay
  //   await new Promise(resolve => setTimeout(resolve, 500))
  // }

  const handleClear = async () => {
    setSearchTerm("")
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  const handleSort = (column: 'score' | 'repos' | 'stars' | 'followers') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(column)
      setSortOrder(column === 'score' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground text-lg">
            Top developers ranked by their Gitivity Score
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px] px-4 py-2 border rounded-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary grow"
          />
          <StatefulButton onClick={handleClear} className="bg-muted hover:bg-muted/80 text-muted-foreground">              
            Clear
          </StatefulButton>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="text-base">
                <TableHead className="w-20 text-base font-semibold">Rank</TableHead>
                <TableHead className="text-base font-semibold">Developer</TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-base font-semibold" onClick={() => handleSort('score')}>
                  <div className="flex items-center justify-center gap-1">
                    Score
                    <Icon icon={sortBy === 'score' ? (sortOrder === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up') : 'mdi:unfold-more-horizontal'} className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-base font-semibold" onClick={() => handleSort('repos')}>
                  <div className="flex items-center justify-center gap-1">
                    Repos
                    <Icon icon={sortBy === 'repos' ? (sortOrder === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up') : 'mdi:unfold-more-horizontal'} className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-base font-semibold" onClick={() => handleSort('stars')}>
                  <div className="flex items-center justify-center gap-1">
                    Stars
                    <Icon icon={sortBy === 'stars' ? (sortOrder === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up') : 'mdi:unfold-more-horizontal'} className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-base font-semibold" onClick={() => handleSort('followers')}>
                  <div className="flex items-center justify-center gap-1">
                    Followers
                    <Icon icon={sortBy === 'followers' ? (sortOrder === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up') : 'mdi:unfold-more-horizontal'} className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right text-base font-semibold">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => {
                const stats = profile.stats as unknown as GitivityStats
                const originalIndex = profiles.findIndex(p => p.username === profile.username)
                const rank = originalIndex + 1
                
                return (
                  <TableRow key={profile.username}>
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-3">
                        {rank <= 3 && (
                          <Icon 
                            icon={
                              rank === 1 
                                ? 'emojione:sports-medal' 
                                : rank === 2 
                                ? 'emojione:2nd-place-medal' 
                                : 'emojione:3rd-place-medal'
                            }
                            className="text-2xl"
                          />
                        )}
                        <span className={`text-lg ${rank <= 3 ? 'font-bold' : 'font-semibold'}`}>
                          #{rank}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <LinkPreview 
                        url={`https://github.com/${profile.username}`}
                        className="block"
                      >
                        <div className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 rounded-lg p-3 -m-3 transition-colors">
                          {profile.avatarUrl && (
                            <Image
                              src={profile.avatarUrl}
                              alt={profile.username}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full border-2"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-lg">{stats?.name || profile.username}</div>
                            <div className="text-base text-muted-foreground">
                              @{profile.username}
                            </div>
                          </div>
                        </div>
                      </LinkPreview>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-lg py-4">
                      <span className={
                        profile.score >= 95 ? "text-purple-400" :
                        profile.score >= 70 ? "text-green-400" :
                        profile.score >= 40 ? "text-yellow-400" :
                        "text-red-400"
                      }>
                        {profile.score.toLocaleString()}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-base py-4">
                      {stats?.publicRepos?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-base py-4">
                      {stats?.totalStarsReceived?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-base py-4">
                      {stats?.followers?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right text-base text-muted-foreground py-4">
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredProfiles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No profiles found. {searchTerm ? 'Try a different search term.' : 'Be the first to get analyzed!'}</p>
            </div>
          )}
        </div>

        {filteredProfiles.length > 0 && (
          <div className="text-center text-base text-muted-foreground">
            Showing {filteredProfiles.length} developer{filteredProfiles.length !== 1 ? 's' : ''} 
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  )
}