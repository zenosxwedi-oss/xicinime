import { NextResponse } from 'next/server';

const VAST_URL =
  'https://smooth-survey.com/dpm.FIzodpGON/v/ZeGlUw/Ge_m/9RuVZkUElPk/P/TJcgxZNTzWMp3OOTDYkXtFNLzQE/3/MBzJcc5iMmwf';

function parseSeconds(timeStr: string): number {
  if (!timeStr) return 5;
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  }
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(timeStr) || 5;
}

export async function GET() {
  try {
    const res = await fetch(VAST_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
        Accept: '*/*',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ videoUrl: '', skipOffset: 5, clickUrl: '' });
    }

    const xml = await res.text();

    /* ── Parse MediaFile URL ── */
    const cdataMedia = xml.match(/<MediaFile[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/MediaFile>/i);
    const rawMedia = xml.match(/<MediaFile[^>]*>\s*(https?:\/\/[^\s<]+)\s*<\/MediaFile>/i);
    const videoUrl = (cdataMedia?.[1] ?? rawMedia?.[1] ?? '').trim();

    /* ── Parse skipoffset ── */
    const skipMatch = xml.match(/skipoffset="([^"]+)"/i);
    const skipOffset = parseSeconds(skipMatch?.[1] ?? '00:00:05');

    /* ── Parse ClickThrough ── */
    const cdataClick = xml.match(/<ClickThrough[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/ClickThrough>/i);
    const rawClick = xml.match(/<ClickThrough[^>]*>\s*(https?:\/\/[^\s<]+)\s*<\/ClickThrough>/i);
    const clickUrl = (cdataClick?.[1] ?? rawClick?.[1] ?? '').trim();

    return NextResponse.json({ videoUrl, skipOffset, clickUrl });
  } catch {
    return NextResponse.json({ videoUrl: '', skipOffset: 5, clickUrl: '' });
  }
}
