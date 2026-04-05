import { getGenres } from '@/lib/api';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Semua Genre Anime',
  description: 'Temukan anime berdasarkan genre favoritmu — action, romance, fantasy, horror, dan banyak lagi.',
};

export const revalidate = 86400;

const COLORS = [
  'from-indigo-900/60 to-indigo-800/30 border-indigo-700/40 hover:border-indigo-500/60',
  'from-purple-900/60 to-purple-800/30 border-purple-700/40 hover:border-purple-500/60',
  'from-blue-900/60 to-blue-800/30 border-blue-700/40 hover:border-blue-500/60',
  'from-emerald-900/60 to-emerald-800/30 border-emerald-700/40 hover:border-emerald-500/60',
  'from-orange-900/60 to-orange-800/30 border-orange-700/40 hover:border-orange-500/60',
  'from-pink-900/60 to-pink-800/30 border-pink-700/40 hover:border-pink-500/60',
  'from-cyan-900/60 to-cyan-800/30 border-cyan-700/40 hover:border-cyan-500/60',
  'from-red-900/60 to-red-800/30 border-red-700/40 hover:border-red-500/60',
];

export default async function GenresPage() {
  const { genreList } = await getGenres();
  const sorted = [...genreList].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Tag className="w-7 h-7 text-indigo-400" />
          Semua Genre
        </h1>
        <p className="text-gray-400">{genreList.length} genre tersedia</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sorted.map((genre, i) => (
          <Link
            key={genre.genreId}
            href={`/genres/${genre.genreId}`}
            className={`group bg-gradient-to-br ${COLORS[i % COLORS.length]} border rounded-2xl px-4 py-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
          >
            <span className="text-sm font-semibold text-white group-hover:text-white/90">
              {genre.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
