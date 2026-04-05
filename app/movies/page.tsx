import { getMovies } from '@/lib/api';
import AnimeCard from '@/components/AnimeCard';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Anime Movies' };
export const revalidate = 600;

export default async function MoviesPage() {
  const data = await getMovies();
  const list = data.animeList ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Anime Movies</h1>
        <p className="text-gray-500 text-sm">Koleksi film anime ({list.length} judul)</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {list.map((anime) => (
          <AnimeCard key={anime.animeId} anime={anime} />
        ))}
      </div>
    </div>
  );
}
