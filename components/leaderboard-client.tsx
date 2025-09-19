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
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import Image from "next/image"
import { type GitivityStats } from "@/lib/analysis"
import { type JsonValue } from "@prisma/client/runtime/library"
import Link from "next/link";

interface LeaderboardProfile {
  username: string;
  score: number;
  avatarUrl: string | null;
  stats: JsonValue;
  updatedAt: string;
}

interface LeaderboardClientProps {
  initialProfiles: LeaderboardProfile[];
}

export function LeaderboardClient({ initialProfiles }: LeaderboardClientProps) {
  const [profiles] = useState<LeaderboardProfile[]>(initialProfiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<'score' | 'repos' | 'stars' | 'followers'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filteredProfiles, setFilteredProfiles] = useState<LeaderboardProfile[]>(initialProfiles)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

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
    setCurrentPage(1) // Reset to first page when filters change
  }, [profiles, searchTerm, sortBy, sortOrder])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex)

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
      setSortOrder('desc')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Link 
          href="/"
          className="inline-block bg-card border border-border hover:bg-muted rounded-full p-3 shadow-lg transition-colors"
          aria-label="Go back to homepage"
        >
          <Icon icon="mdi:arrow-left" className="text-xl text-foreground" />
        </Link>
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

        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-sm md:text-base">
                  <TableHead className="w-16 md:w-20 text-sm md:text-base font-semibold">Rank</TableHead>
                  <TableHead className="min-w-[200px] text-sm md:text-base font-semibold">Developer</TableHead>
                  <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-sm md:text-base font-semibold min-w-[80px]" onClick={() => handleSort('score')}>
                    <div className="flex items-center justify-center gap-1">                      Score                     
                      <Icon icon={sortBy === 'score' ? (sortOrder === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up') : 'mdi:unfold-more-horizontal'} className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-sm md:text-base font-semibold min-w-[70px] hidden sm:table-cell" onClick={() => handleSort('repos')}>
                    <div className="flex items-center justify-center gap-1">
                      <span className="hidden sm:inline">Repos</span>                      
                      <Icon icon={sortBy === 'repos' ? (sortOrder === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up') : 'mdi:unfold-more-horizontal'} className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-sm md:text-base font-semibold min-w-[70px] hidden sm:table-cell" onClick={() => handleSort('stars')}>
                    <div className="flex items-center justify-center gap-1">
                      Stars
                      <Icon icon={sortBy === 'stars' ? (sortOrder === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up') : 'mdi:unfold-more-horizontal'} className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-sm md:text-base font-semibold min-w-[80px] hidden md:table-cell" onClick={() => handleSort('followers')}>
                    <div className="flex items-center justify-center gap-1">
                      Followers
                      <Icon icon={sortBy === 'followers' ? (sortOrder === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up') : 'mdi:unfold-more-horizontal'} className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right text-sm md:text-base font-semibold min-w-[100px] hidden lg:table-cell">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProfiles.map((profile) => {
                  const stats = profile.stats as unknown as GitivityStats
                  const originalIndex = filteredProfiles.findIndex(p => p.username === profile.username)
                  const rank = originalIndex + 1

                  return (
                    <TableRow key={profile.username}>
                      <TableCell className="font-medium py-2 md:py-4">
                        <div className="flex items-center gap-1 md:gap-3">
                          {rank <= 3 && (
                            <Icon
                              icon={
                                rank === 1
                                  ? 'noto:trophy'
                                  : rank === 2
                                    ? 'emojione:2nd-place-medal'
                                    : 'emojione:3rd-place-medal'
                              }
                              className="text-lg md:text-2xl"
                            />
                          )}
                          <span className={`text-base md:text-lg ${rank <= 3 ? 'font-bold' : 'font-semibold'}`}>
                            #{rank}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 md:py-4">
                        <LinkPreview
                          url={`https://github.com/${profile.username}`}
                          className="block"
                        >
                          <div className="flex items-center gap-2 md:gap-4 cursor-pointer hover:bg-muted/50 rounded-lg p-2 md:p-3 -m-2 md:-m-3 transition-colors">
                            {profile.avatarUrl && (
                              <Image
                                src={profile.avatarUrl}
                                alt={profile.username}
                                width={48}
                                height={48}
                                className="w-16 h-16 md:w-12 md:h-12 rounded-full border-2 flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-base md:text-lg truncate">{stats?.name || profile.username}</div>
                              <div className="text-sm md:text-base text-muted-foreground truncate">
                                @{profile.username}
                              </div>
                            </div>
                          </div>
                        </LinkPreview>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-base md:text-lg py-2 md:py-4">
                        <span className={
                          profile.score >= 95 ? "text-purple-400" :
                            profile.score >= 70 ? "text-green-400" :
                              profile.score >= 40 ? "text-yellow-400" :
                                "text-red-400"
                        }>
                          {profile.score.toLocaleString()}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm md:text-base py-2 md:py-4 hidden sm:table-cell">
                        {stats?.publicRepos?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm md:text-base py-2 md:py-4 hidden sm:table-cell">
                        {stats?.totalStarsReceived?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm md:text-base py-2 md:py-4 hidden md:table-cell">
                        {stats?.followers?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-right text-sm md:text-base text-muted-foreground py-2 md:py-4 hidden lg:table-cell">
                        {new Date(profile.updatedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {currentProfiles.length === 0 && filteredProfiles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No profiles found. {searchTerm ? 'Try a different search term.' : 'Be the first to get analyzed!'}</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="px-6 py-3 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <Icon icon="mdi:chevron-left" className="text-lg" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const distance = Math.abs(page - currentPage)
                  return distance <= 1 || page === 1 || page === totalPages
                })
                .map((page, index, visiblePages) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && visiblePages[index - 1] !== page - 1 && (
                      <span className="px-1 md:px-2 text-muted-foreground text-sm">...</span>
                    )}
                    <Button
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`px-4 py-2 text-sm md:text-base ${currentPage === page 
                        ? 'rounded-full bg-primary text-primary-foreground' 
                        : 'rounded-full bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>

            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="px-6 py-3 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <Icon icon="mdi:chevron-right" className="text-lg" />
            </Button>
          </div>
        )}

        {filteredProfiles.length > 0 && (
          <div className="text-center text-base text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredProfiles.length)} of {filteredProfiles.length} developer{filteredProfiles.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  )
}