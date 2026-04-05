import { getGenreAnime } from '@/lib/api';
import AnimeCard from '@/components/AnimeCard';
import type { Metadata } from 'next';

const SITE_URL = 'https://xicinime-m5pc.vercel.app';

interface Props {
  params: Promise<{ genreId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genreId } = await params;
  const label = genreId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const pageUrl = `${SITE_URL}/genres/${genreId}`;
  return {
    title: `Anime Genre ${label}`,
    description: `Daftar anime genre ${label} sub indo terlengkap. Nonton streaming gratis di xicinime.`,
    keywords: [`anime ${label}`, `${label} sub indo`, `nonton anime ${label}`, 'anime sub indo'],
    alternates: { canonical: pageUrl },
    openGraph: {
      url: pageUrl,
      title: `Anime Genre ${label} | xicinime`,
      description: `Daftar anime genre ${label} sub indo terlengkap. Nonton streaming gratis di xicinime.`,
      locale: 'id_ID',
      siteName: 'xicinime',
    },
  };
}

export const revalidate = 600;

export default async function GenrePage({ params }: Props) {
  const { genreId } = await params;
  const label = genreId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const data = await getGenreAnime(genreId);
  const list = data.animeList ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-indigo-400 text-sm font-medium mb-1">Genre</p>
        <h1 className="text-2xl font-black text-white mb-1">{label}</h1>
        <p className="text-gray-500 text-sm">{list.length} judul ditemukan</p>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-4">😕</p>
          <p className="text-lg font-semibold text-gray-500">Tidak ada anime untuk genre ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {list.map((anime) => (
            <AnimeCard key={anime.animeId} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
