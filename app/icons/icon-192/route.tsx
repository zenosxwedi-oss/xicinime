import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ fontSize: 80, lineHeight: 1, color: 'white', fontWeight: 900 }}>X</div>
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginTop: -4 }}>
          CINIME
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
