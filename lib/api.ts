import axios from 'axios';
import type {
  AnimeDetail,
  AnimeListItem,
  EpisodeDetail,
  GenreItem,
  HomeData,
  ScheduleDay,
} from '@/types';

const BASE = 'https://www.sankavollerei.com/anime/samehadaku';

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0',
  },
});

async function get<T>(path: string): Promise<T> {
  const { data } = await apiClient.get<{ data: T }>(path);
  return data.data;
}

export async function getHome(): Promise<HomeData> {
  return get<HomeData>('/home');
}

export async function getRecent(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/recent');
}

export async function getPopular(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/popular');
}

export async function getOngoing(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/ongoing');
}

export async function getCompleted(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/completed');
}

export async function getMovies(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/movies');
}

export async function getBatch(): Promise<{ batchList: AnimeListItem[] }> {
  return get<{ batchList: AnimeListItem[] }>('/batch');
}

export async function searchAnime(q: string): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/search?q=${encodeURIComponent(q)}`);
}

export async function getGenres(): Promise<{ genreList: GenreItem[] }> {
  return get<{ genreList: GenreItem[] }>('/genres');
}

export async function getGenreAnime(genreId: string): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/genres/${genreId}`);
}

export async function getAnimeDetail(animeId: string): Promise<AnimeDetail> {
  return get<AnimeDetail>(`/anime/${animeId}`);
}

export async function getEpisode(episodeId: string): Promise<EpisodeDetail> {
  return get<EpisodeDetail>(`/episode/${episodeId}`);
}

export async function getServerUrl(serverId: string): Promise<{ url: string }> {
  return get<{ url: string }>(`/server/${serverId}`);
}

export async function getSchedule(): Promise<{ days: ScheduleDay[] }> {
  return get<{ days: ScheduleDay[] }>('/schedule');
}
