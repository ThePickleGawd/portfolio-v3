import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          borderRadius: 6,
          color: '#FFFFFF',
          fontSize: 16,
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
        }}
      >
        Lu
      </div>
    ),
    { ...size },
  )
}
