-- Add performance indexes for critical queries

-- Index for leaderboard queries (ORDER BY score DESC)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_score_desc" ON "gitivity_profiles" ("score" DESC);

-- Index for cache validation queries (ORDER BY updatedAt DESC)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_updated_at_desc" ON "gitivity_profiles" ("updatedAt" DESC);

-- Composite index for user cache lookups (WHERE username = ? AND updatedAt > ?)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_username_updated" ON "gitivity_profiles" ("username", "updatedAt");

-- Index for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_created_at" ON "gitivity_profiles" ("createdAt");

-- Analyze tables to update statistics for query planner
ANALYZE "gitivity_profiles";