import { searchAnime } from '@/lib/api';
import AnimeCard from '@/components/AnimeCard';
import SearchBar from '@/components/SearchBar';
import type { AnimeListItem } from '@/types';
import type { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Hasil pencarian: ${q}` : 'Browse Anime',
  };
}

export default async function BrowsePage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  let animeList: AnimeListItem[] = [];
  let error = '';

  if (query) {
    try {
      const result = await searchAnime(query);
      animeList = result.animeList ?? [];
    } catch {
      error = 'Gagal memuat hasil pencarian.';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-2">Cari Anime</h1>
        <p className="text-gray-500 text-sm mb-5">
          Temukan anime favoritmu dari database Winbu
        </p>
        <div className="max-w-xl">
          <SearchBar defaultValue={query} />
        </div>
      </div>

      {query && (
        <div className="mb-5 text-sm text-gray-400">
          {animeList.length > 0
            ? `Menampilkan ${animeList.length} hasil untuk "${query}"`
            : !error && `Tidak ada hasil untuk "${query}"`}
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-red-400">{error}</div>
      )}

      {!query && (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-gray-500">Masukkan judul anime</p>
          <p className="text-sm mt-1">Contoh: One Piece, Naruto, Bleach</p>
        </div>
      )}

      {animeList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
