import Link from 'next/link';
import Image from 'next/image';
import { getHome, getPopular } from '@/lib/api';
import AnimeCard from '@/components/AnimeCard';
import SectionHeader from '@/components/SectionHeader';
import { Clock, Zap, TrendingUp, Film, Calendar, BookOpen, ChevronRight } from 'lucide-react';

export const revalidate = 60;

const quickLinks = [
  { href: '/ongoing', label: 'Ongoing', icon: Zap, color: 'text-green-400 bg-green-900/30 border-green-800/50' },
  { href: '/popular', label: 'Populer', icon: TrendingUp, color: 'text-orange-400 bg-orange-900/30 border-orange-800/50' },
  { href: '/movies', label: 'Movies', icon: Film, color: 'text-blue-400 bg-blue-900/30 border-blue-800/50' },
  { href: '/schedule', label: 'Jadwal', icon: Calendar, color: 'text-purple-400 bg-purple-900/30 border-purple-800/50' },
  { href: '/genres', label: 'Genre', icon: BookOpen, color: 'text-pink-400 bg-pink-900/30 border-pink-800/50' },
  { href: '/completed', label: 'Completed', icon: ChevronRight, color: 'text-indigo-400 bg-indigo-900/30 border-indigo-800/50' },
];

export default async function HomePage() {
  const [home, popularData] = await Promise.all([
    getHome(),
    getPopular().catch(() => ({ animeList: [] })),
  ]);

  const recent = home.recent?.animeList ?? [];
  const movies = home.movie?.animeList ?? [];
  const popular = popularData.animeList ?? [];
  const hero = recent[0];

  return (
    <div>
      {/* Hero */}
      {hero && (
        <section className="relative h-[65vh] min-h-[420px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={hero.poster}
              alt={hero.title}
              fill
              priority
              className="object-cover object-top opacity-40 scale-105 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14]/90 via-[#0d0d14]/40 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 pb-14 w-full">
            <div className="flex items-end gap-6 max-w-2xl">
              <div className="hidden sm:block shrink-0">
                <div className="relative w-32 h-48 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
                  <Image src={hero.poster} alt={hero.title} fill className="object-cover" priority />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-300 bg-green-900/40 border border-green-700/50 px-2.5 py-1 rounded-full">
                    <Zap className="w-3 h-3" /> Terbaru
                  </span>
                  {hero.type && (
                    <span className="text-xs font-semibold text-indigo-300 bg-indigo-900/40 border border-indigo-700/50 px-2.5 py-1 rounded-full">{hero.type}</span>
                  )}
                  {hero.episodes && (
                    <span className="text-xs text-gray-400">Episode {hero.episodes}</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight">
                  {hero.title}
                </h1>
                {hero.releasedOn && (
                  <p className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
                    <Clock className="w-4 h-4" /> {hero.releasedOn}
                  </p>
                )}
                <div className="flex gap-3">
                  <Link href={`/anime/${hero.animeId}`}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40">
                    Lihat Detail
                  </Link>
                  <Link href="/browse"
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur border border-white/10">
                    Jelajahi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Quick links */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickLinks.map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-lg ${color}`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold text-white">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent */}
        {recent.length > 0 && (
          <section>
            <SectionHeader title="Anime Terbaru" href="/ongoing" viewAllLabel="Lihat semua" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recent.slice(0, 12).map((anime) => (
                <AnimeCard key={`${anime.animeId}-${anime.episodes}`} anime={anime} showEpisode />
              ))}
            </div>
          </section>
        )}

        {/* Popular */}
        {popular.length > 0 && (
          <section>
            <SectionHeader title="Populer" href="/popular" viewAllLabel="Lihat semua" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {popular.slice(0, 6).map((anime) => (
                <AnimeCard key={anime.animeId} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* Movies */}
        {movies.length > 0 && (
          <section>
            <SectionHeader title="Movies" href="/movies" viewAllLabel="Lihat semua" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.slice(0, 6).map((anime) => (
                <AnimeCard key={anime.animeId} anime={anime} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
