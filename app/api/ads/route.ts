import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const TMP_FILE = '/tmp/ads.json';
const REPO_FILE = join(process.cwd(), 'data', 'ads.json');

export interface Ad {
  id: string;
  type: 'banner' | 'script';
  position: 'top' | 'bottom' | 'sidebar';
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  scriptCode?: string;
  active: boolean;
  createdAt: string;
}

function readAds(): Ad[] {
  try {
    if (existsSync(TMP_FILE)) return JSON.parse(readFileSync(TMP_FILE, 'utf-8'));
    if (existsSync(REPO_FILE)) return JSON.parse(readFileSync(REPO_FILE, 'utf-8'));
    return [];
  } catch {
    return [];
  }
}

function writeAds(ads: Ad[]) {
  writeFileSync(TMP_FILE, JSON.stringify(ads, null, 2));
}

export async function GET() {
  return NextResponse.json(readAds());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ads = readAds();
  const newAd: Ad = {
    id: Date.now().toString(),
    type: body.type,
    position: body.position,
    title: body.title,
    imageUrl: body.imageUrl,
    linkUrl: body.linkUrl,
    scriptCode: body.scriptCode,
    active: true,
    createdAt: new Date().toISOString(),
  };
  ads.push(newAd);
  writeAds(ads);
  return NextResponse.json(newAd, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const ads = readAds().filter((a) => a.id !== id);
  writeAds(ads);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { id, active } = await req.json();
  const ads = readAds().map((a) => (a.id === id ? { ...a, active } : a));
  writeAds(ads);
  return NextResponse.json({ ok: true });
}
