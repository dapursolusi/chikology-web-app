import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>
        Chikology
      </span>
      <span style={{ fontSize: 28, opacity: 0.8 }}>
        Kenali Stres, Kelola Lebih Baik
      </span>
    </div>,
    { ...size }
  );
}
