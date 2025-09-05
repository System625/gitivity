import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const score = searchParams.get('score')
    const avatar = searchParams.get('avatar')

    if (!username || !score) {
      return new Response('Missing required parameters', { status: 400 })
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a1d2e',
            padding: '40px',
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(123, 59, 75, 0.1) 0%, transparent 50%)',
            }}
          />
          
          {/* Main card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#2d314e',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '60px 80px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Avatar */}
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={username}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '4px solid #7b3b4b',
                  marginBottom: '32px',
                }}
              />
            )}

            {/* Username */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              @{username}
            </div>

            {/* Score */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: '#7b3b4b',
                }}
              >
                {score}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '500',
                }}
              >
                Gitivity Score
              </div>
            </div>

            {/* Branding */}
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '500',
              }}
            >
              Gitivity
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}