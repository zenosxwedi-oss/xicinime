import { NextResponse } from 'next/server';

const VAST_URL =
  'https://smooth-survey.com/dpm.FIzodpGON/v/ZeGlUw/Ge_m/9RuVZkUElPk/P/TJcgxZNTzWMp3OOTDYkXtFNLzQE/3/MBzJcc5iMmwf';

export async function GET() {
  return NextResponse.json({ vastUrl: VAST_URL });
}
