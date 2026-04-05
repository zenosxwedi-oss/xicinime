import Link from 'next/link';
import Image from 'next/image';
import { Star, Play } from 'lucide-react';
import type { AnimeListItem } from '@/types';

interface Props {
  anime: AnimeListItem;
  showEpisode?: boolean;
}

export default function AnimeCard({ anime, showEpisode = false }: Props) {
  return (
    <Link
      href={`/anime/${anime.animeId}`}
      className="group block rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/40 bg-[#111118]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a2e]">
        {anime.poster ? (
          <>
            <Image
              src={anime.poster}
              alt={anime.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Hover overlay with play button */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-900/50 scale-75 group-hover:scale-100 transition-transform duration-200">
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs">
            No Image
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Episode badge */}
        {showEpisode && anime.episodes && (
          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg">
            Ep {anime.episodes}
          </div>
        )}

        {/* Score badge */}
        {anime.score && anime.score !== '' && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
            <Star className="w-2.5 h-2.5 fill-current" />
            {anime.score}
          </div>
        )}

        {/* Type badge */}
        {anime.type && !showEpisode && (
          <div className="absolute bottom-2 left-2 bg-indigo-900/80 backdrop-blur-sm text-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            {anime.type}
          </div>
        )}

        {/* Status badge */}
        {anime.status && showEpisode && (
          <div className={`absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm ${
            anime.status === 'Ongoing'
              ? 'bg-emerald-500/80 text-white'
              : 'bg-blue-500/80 text-white'
          }`}>
            {anime.status}
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="text-xs font-semibold text-gray-200 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors duration-200">
          {anime.title}
        </h3>
        {anime.releasedOn && (
          <p className="text-[10px] text-gray-600 mt-1">{anime.releasedOn}</p>
        )}
      </div>
    </Link>
  );
}
