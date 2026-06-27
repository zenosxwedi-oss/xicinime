import { getEpisode } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import WatchPlayer from '@/components/WatchPlayer';

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

  const servers = (ep.server?.qualities ?? []).flatMap((q) =>
    q.serverList.map((s) => ({ label: `${q.title} - ${s.title}`, serverId: s.serverId }))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/anime/${ep.animeId}`} className="hover:text-white transition-colors line-clamp-1 max-w-[200px]">
          Detail Anime
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300 line-clamp-1">{ep.title}</span>
      </div>

      <h1 className="text-2xl font-black text-white mb-6">{ep.title}</h1>

      <WatchPlayer
        defaultStreamingUrl={ep.defaultStreamingUrl}
        servers={servers}
        prevEpisode={ep.hasPrevEpisode && ep.prevEpisode ? { episodeId: ep.prevEpisode.episodeId } : null}
        nextEpisode={ep.hasNextEpisode && ep.nextEpisode ? { episodeId: ep.nextEpisode.episodeId } : null}
        animeId={ep.animeId}
        episodeTitle={ep.title}
      />

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
