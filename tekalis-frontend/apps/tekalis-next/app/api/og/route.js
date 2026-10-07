import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Kit solaire Tekalis';
  const subtitle = searchParams.get('subtitle') || 'Estimation indicative';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0F7BFF',
          color: '#fff',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 800, textAlign: 'center', lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.9 }}>{subtitle}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
