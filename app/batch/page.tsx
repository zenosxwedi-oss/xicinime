import { getBatch } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Download Batch Anime' };
export const revalidate = 600;

export default async function BatchPage() {
  const data = await getBatch();
  const list = data.batchList ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Download Batch</h1>
        <p className="text-gray-500 text-sm">Download episode batch ({list.length} judul)</p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-lg font-semibold text-gray-500">Belum ada data batch</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {list.map((anime) => (
            <Link
              key={anime.animeId}
              href={`/anime/${anime.animeId}`}
              className="group block bg-[#111118] rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a2e]">
                {anime.poster && (
                  <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                  {anime.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
