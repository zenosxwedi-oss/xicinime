import axios from 'axios';
import type {
  AnimeDetail,
  AnimeListItem,
  EpisodeDetail,
  FilmDetail,
  GenreItem,
  HomeData,
  ScheduleDay,
  SeriesDetail,
} from '@/types';

const BASE = 'https://www.sankavollerei.com/anime/winbu';

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

export async function searchAnime(q: string): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/search?q=${encodeURIComponent(q)}`);
}

export async function getAnimeDonghua(page = 1): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/animedonghua?page=${page}`);
}

export async function getFilmList(page = 1): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/film?page=${page}`);
}

/** @deprecated Use getFilmList instead */
export async function getMovies(): Promise<{ animeList: AnimeListItem[] }> {
  return getFilmList();
}

export async function getSeriesList(page = 1): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/series?page=${page}`);
}

export async function getTvShow(page = 1): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/tvshow?page=${page}`);
}

export async function getOthers(page = 1): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/others?page=${page}`);
}

export async function getGenres(): Promise<{ genreList: GenreItem[] }> {
  return get<{ genreList: GenreItem[] }>('/genres');
}

export async function getGenreAnime(genreId: string): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/genre/${genreId}`);
}

export async function getCatalog(params: {
  title?: string;
  page?: number;
  order?: string;
  type?: string;
  status?: string;
}): Promise<{ animeList: AnimeListItem[] }> {
  const q = new URLSearchParams();
  if (params.title) q.set('title', params.title);
  if (params.page) q.set('page', String(params.page));
  if (params.order) q.set('order', params.order);
  if (params.type) q.set('type', params.type);
  if (params.status) q.set('status', params.status);
  return get<{ animeList: AnimeListItem[] }>(`/catalog?${q.toString()}`);
}

export async function getSchedule(day?: string): Promise<{ days: ScheduleDay[] }> {
  const path = day ? `/schedule?day=${encodeURIComponent(day)}` : '/schedule';
  return get<{ days: ScheduleDay[] }>(path);
}

export async function getUpdate(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/update');
}

export async function getLatest(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/latest');
}

export async function getOngoing(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/ongoing');
}

export async function getCompleted(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/completed');
}

export async function getPopular(): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>('/populer');
}

export async function getAllAnime(page = 1): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/all-anime?page=${page}`);
}

export async function getAllAnimeReverse(page = 1): Promise<{ animeList: AnimeListItem[] }> {
  return get<{ animeList: AnimeListItem[] }>(`/all-anime-reverse?page=${page}`);
}

export async function getList(params: {
  order?: string;
  status?: string;
  type?: string;
}): Promise<{ animeList: AnimeListItem[] }> {
  const q = new URLSearchParams();
  if (params.order) q.set('order', params.order);
  if (params.status) q.set('status', params.status);
  if (params.type) q.set('type', params.type);
  return get<{ animeList: AnimeListItem[] }>(`/list?${q.toString()}`);
}

export async function getAnimeDetail(animeId: string): Promise<AnimeDetail> {
  return get<AnimeDetail>(`/anime/${animeId}`);
}

export async function getSeriesDetail(seriesId: string): Promise<SeriesDetail> {
  return get<SeriesDetail>(`/series/${seriesId}`);
}

export async function getFilmDetail(filmId: string): Promise<FilmDetail> {
  return get<FilmDetail>(`/film/${filmId}`);
}

export async function getEpisode(episodeId: string): Promise<EpisodeDetail> {
  return get<EpisodeDetail>(`/episode/${episodeId}`);
}

export async function getServerUrl(params: {
  post: string | number;
  nume: string | number;
  type: string;
}): Promise<{ url: string }> {
  return get<{ url: string }>(
    `/server?post=${params.post}&nume=${params.nume}&type=${encodeURIComponent(params.type)}`
  );
}
