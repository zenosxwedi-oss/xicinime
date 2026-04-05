import { getOngoing } from '@/lib/api';
import AnimeCard from '@/components/AnimeCard';
import type { Metadata } from 'next';
import { Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Anime Ongoing',
  description: 'Daftar anime yang sedang tayang dan update terbaru. Nonton anime ongoing sub indo gratis di xicinime.',
};

export const revalidate = 300;

export default async function OngoingPage() {
  const { animeList } = await getOngoing();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <span className="w-9 h-9 bg-green-600/20 border border-green-600/40 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-400" />
          </span>
          Anime Ongoing
        </h1>
        <p className="text-gray-400">{animeList.length} judul sedang tayang</p>
      </div>

      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <AnimeCard key={`${anime.animeId}-${anime.episodes}`} anime={anime} showEpisode />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">Tidak ada data ongoing.</div>
      )}
    </div>
  );
}
