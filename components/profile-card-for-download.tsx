import { forwardRef } from 'react'
import Image from 'next/image'
import { GitivityStats } from '@/lib/analysis'

interface ProfileCardForDownloadProps {
  profile: {
    username: string;
    score: number;
    avatarUrl?: string | null;
    rank?: number;
    totalUsers?: number;
  };
  stats: GitivityStats;
}

// Using forwardRef to allow the parent to get a reference to the root div
export const ProfileCardForDownload = forwardRef<HTMLDivElement, ProfileCardForDownloadProps>(
  ({ profile, stats }, ref) => {
    // We'll hardcode the theme to a dark theme for consistency in downloads.
    // Or you could pass a theme prop if you want both.
    const isDarkMode = true;

    return (
      // The outer div is what html2canvas will capture.
      // We give it a fixed width and use dark mode styles directly.
      <div
        ref={ref}
        style={{ 
          width: '400px',
          backgroundColor: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '16px',
          padding: '20px',
          fontFamily: 'sans-serif',
          color: 'white'
        }}
      >
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.username}
                width={48}
                height={48}
                style={{ 
                  borderRadius: '50%', 
                  border: '2px solid #7b3b4b',
                  width: '48px',
                  height: '48px',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                unoptimized
                priority
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                border: '2px solid #7b3b4b',
                backgroundColor: '#161b22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7b3b4b',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: '0' }}>
                {stats?.name || profile.username}
              </h1>
              <p style={{ fontSize: '14px', color: '#8b949e', margin: '4px 0 0 0' }}>
                @{profile.username}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#7b3b4b', marginBottom: '4px' }}>
              {profile.score}%
            </div>
            <div style={{ fontSize: '14px', color: '#8b949e' }}>Gitivity Score</div>
            {profile.rank && profile.totalUsers && (
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b3b4b', marginTop: '4px' }}>
                Rank #{profile.rank.toLocaleString()} of {profile.totalUsers.toLocaleString()}
              </div>
            )}
          </div>

          {stats?.bio && (
            <p style={{ color: '#8b949e', fontSize: '14px', maxWidth: '400px', margin: '16px auto 0' }}>
              Bio: {stats.bio}
            </p>
          )}
        </div>

        {/* Score Breakdown */}
        {stats?.scoreBreakdown && (
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', color: 'white' }}>
              Score Breakdown
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {/* Creator */}
              <div style={{ 
                textAlign: 'center', 
                padding: '8px', 
                backgroundColor: '#161b22', 
                border: '1px solid #30363d', 
                borderRadius: '6px' 
              }}>
                <div style={{ fontSize: '16px', color: '#7b3b4b', marginBottom: '2px' }}>⭐</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#7b3b4b', marginBottom: '2px' }}>
                  {stats.scoreBreakdown.creatorScore}
                </div>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '10px', marginBottom: '2px' }}>Creator</div>
                <div style={{ color: '#8b949e', fontSize: '9px' }}>Personal impact</div>
              </div>
              {/* Collaborator */}
              <div style={{ 
                textAlign: 'center', 
                padding: '8px', 
                backgroundColor: '#161b22', 
                border: '1px solid #30363d', 
                borderRadius: '6px' 
              }}>
                <div style={{ fontSize: '16px', color: '#7b3b4b', marginBottom: '2px' }}>🤝</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#7b3b4b', marginBottom: '2px' }}>
                  {stats.scoreBreakdown.collaboratorScore}
                </div>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '10px', marginBottom: '2px' }}>Collaborator</div>
                <div style={{ color: '#8b949e', fontSize: '9px' }}>Open source</div>
              </div>
              {/* Craftsmanship */}
              <div style={{ 
                textAlign: 'center', 
                padding: '8px', 
                backgroundColor: '#161b22', 
                border: '1px solid #30363d', 
                borderRadius: '6px' 
              }}>
                <div style={{ fontSize: '16px', color: '#7b3b4b', marginBottom: '2px' }}>🔧</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#7b3b4b', marginBottom: '2px' }}>
                  {stats.scoreBreakdown.craftsmanshipScore}
                </div>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '10px', marginBottom: '2px' }}>Craftsmanship</div>
                <div style={{ color: '#8b949e', fontSize: '9px' }}>Quality</div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {stats?.scoreBreakdown?.achievements && stats.scoreBreakdown.achievements.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #30363d' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', color: 'white' }}>
              Achievements
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {stats.scoreBreakdown.achievements.slice(0, 4).map((achievement) => {
                return (
                  <div 
                    key={achievement.id} 
                    style={{ 
                      backgroundColor: '#161b22', 
                      border: '1px solid #30363d', 
                      borderRadius: '6px', 
                      padding: '8px', 
                      textAlign: 'center', 
                      width: '85px',
                      flexShrink: 0
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                      <div style={{ fontSize: '18px', color: '#7b3b4b' }}>{achievement.icon}</div>
                    </div>
                    <div style={{ fontWeight: '600', color: 'white', marginBottom: '2px', fontSize: '10px' }}>
                      {achievement.name}
                    </div>
                    <div style={{ color: '#8b949e', fontSize: '9px' }}>
                      {achievement.description}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Set a display name for better debugging in React DevTools
ProfileCardForDownload.displayName = 'ProfileCardForDownload';