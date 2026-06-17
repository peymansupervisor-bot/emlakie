import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'EMLAKIE — Find Your Next Rental Home';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#16a34a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* House icon */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
            stroke="white"
            strokeWidth="1.5"
            fill="rgba(255,255,255,0.15)"
          />
          <path d="M9 21V12h6v9" stroke="white" strokeWidth="1.5" />
        </svg>

        {/* Brand name */}
        <div
          style={{
            color: 'white',
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: '-3px',
            marginTop: 24,
            lineHeight: 1,
          }}
        >
          EMLAKIE
        </div>

        {/* Tagline */}
        <div
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 32,
            fontWeight: 500,
            marginTop: 20,
            letterSpacing: '0.5px',
          }}
        >
          Find Your Next Rental Home
        </div>

        {/* URL pill */}
        <div
          style={{
            marginTop: 40,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 100,
            padding: '10px 32px',
            color: 'white',
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          emlakie.com
        </div>
      </div>
    ),
    { ...size }
  );
}
