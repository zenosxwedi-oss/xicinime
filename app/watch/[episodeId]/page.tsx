import { getEpisode } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';

interface Props { params: Promise<{ episodeId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { episodeId } = await params;
  try {
    const ep = await getEpisode(episodeId);
    return {
      title: ep.title,
      description: `Nonton ${ep.title} sub indo streaming gratis di xicinime.`,
    };
  } catch { return { title: 'Tonton Episode' }; }
}

export const revalidate = 3600;

export default async function WatchPage({ params }: Props) {
  const { episodeId } = await params;
  const ep = await getEpisode(episodeId).catch(() => notFound());

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/anime/${ep.animeId}`} className="hover:text-white transition-colors line-clamp-1 max-w-[200px]">
          Detail Anime
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300 line-clamp-1">{ep.title}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-black text-white mb-6">{ep.title}</h1>

      {/* Prev / Next navigation */}
      <div className="flex gap-3 mb-8">
        {ep.hasPrevEpisode && ep.prevEpisode ? (
          <Link href={`/watch/${ep.prevEpisode}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-xl text-sm font-medium text-white transition-all">
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </Link>
        ) : <div />}
        {ep.hasNextEpisode && ep.nextEpisode && (
          <Link href={`/watch/${ep.nextEpisode}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white transition-all ml-auto shadow-lg shadow-indigo-900/40">
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Default stream button */}
      {ep.defaultStreamingUrl && (
        <div className="mb-8">
          <a href={ep.defaultStreamingUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-indigo-900/40">
            <Play className="w-6 h-6" fill="white" />
            Tonton Sekarang
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        </div>
      )}

      {/* Server list by quality */}
      {ep.server?.qualities && ep.server.qualities.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Pilih Server & Kualitas</h2>
          {ep.server.qualities.map((quality) => (
            <div key={quality.title} className="bg-[#111118] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-indigo-300 bg-indigo-900/50 border border-indigo-700/50 px-3 py-1 rounded-full">
                  {quality.title}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quality.serverList.map((server) => (
                  <a key={server.serverId}
                    href={`https://www.sankavollerei.com/anime/samehadaku/server/${server.serverId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all">
                    <Play className="w-3.5 h-3.5" />
                    {server.title}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Episode info */}
      <div className="mt-8 p-5 bg-[#111118] border border-white/5 rounded-2xl flex gap-4">
        {ep.poster && (
          <div className="shrink-0 relative w-20 h-28 rounded-xl overflow-hidden">
            <Image src={ep.poster} alt={ep.title} fill className="object-cover" />
          </div>
        )}
        <div>
          <Link href={`/anime/${ep.animeId}`}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
            ← Kembali ke halaman anime
          </Link>
          {ep.releasedOn && (
            <p className="text-xs text-gray-500 mt-2">Rilis: {ep.releasedOn}</p>
          )}
          {ep.synopsis?.paragraphs?.[0] && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-3">{ep.synopsis.paragraphs[0]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
