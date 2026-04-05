import { getSchedule } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Jadwal Anime Mingguan' };
export const revalidate = 3600;

const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayLabels: Record<string, string> = {
  Sunday: 'Minggu', Monday: 'Senin', Tuesday: 'Selasa',
  Wednesday: 'Rabu', Thursday: 'Kamis', Friday: "Jum'at", Saturday: 'Sabtu',
};

export default async function SchedulePage() {
  const data = await getSchedule();
  const days = data.days ?? [];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const sortedDays = [...days].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Jadwal Anime Mingguan</h1>
        <p className="text-gray-500 text-sm">Jadwal update anime per hari</p>
      </div>

      <div className="space-y-10">
        {sortedDays.map(({ day, animeList }) => (
          <section key={day}>
            <div className="flex items-center gap-3 mb-4">
              <h2
                className={`text-base font-bold px-4 py-1.5 rounded-full ${
                  day === today
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#1a1a2e] text-gray-300'
                }`}
              >
                {dayLabels[day] ?? day}
              </h2>
              {day === today && (
                <span className="text-xs text-indigo-400 font-medium">Hari ini</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {animeList.map((anime) => (
                <Link
                  key={anime.animeId}
                  href={`/anime/${anime.animeId}`}
                  className="flex items-center gap-3 p-3 bg-[#111118] border border-white/5 hover:border-indigo-500/50 rounded-xl transition-all duration-200 group"
                >
                  <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-[#1a1a2e]">
                    {anime.poster && (
                      <Image
                        src={anime.poster}
                        alt={anime.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                      {anime.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{anime.genres}</p>
                    {anime.estimation && (
                      <p className="flex items-center gap-1 text-xs text-indigo-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {anime.estimation}
                      </p>
                    )}
                    {anime.score && (
                      <p className="text-xs text-yellow-500 mt-0.5">★ {anime.score}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
