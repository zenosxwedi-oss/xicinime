import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE = 'https://www.sankavollerei.com/anime/samehadaku';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  const { serverId } = await params;
  try {
    const { data } = await axios.get<{ data: { url: string } }>(
      `${BASE}/server/${serverId}`,
      {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );
    return NextResponse.json({ url: data.data?.url ?? '' });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch server' }, { status: 500 });
  }
}
