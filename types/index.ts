export interface GenreItem {
  title: string;
  genreId: string;
  href: string;
  samehadakuUrl?: string;
}

export interface AnimeListItem {
  title: string;
  poster: string;
  type?: string;
  score?: string;
  status?: string;
  episodes?: string | number;
  releasedOn?: string;
  releaseDate?: string;
  animeId: string;
  href: string;
  samehadakuUrl?: string;
  genreList?: GenreItem[];
}

export interface AnimeDetail {
  title: string;
  poster: string;
  score: { value: string; users: string } | null;
  japanese: string;
  synonyms: string;
  english: string;
  status: string;
  type: string;
  source: string;
  duration: string;
  episodes: number | null;
  season: string;
  studios: string;
  producers: string;
  aired: string;
  trailer: string;
  synopsis: {
    paragraphs: string[];
    connections: string[];
  };
  genreList: GenreItem[];
  batchList: { title: string; batchId: string; href: string; samehadakuUrl?: string }[];
  episodeList: { title: string; episodeNum?: string | number; episodeId: string; href: string; samehadakuUrl?: string }[];
}

export interface ScheduleAnime {
  title: string;
  poster: string;
  type: string;
  score: string;
  estimation: string;
  genres: string;
  animeId: string;
  href: string;
  samehadakuUrl?: string;
}

export interface ScheduleDay {
  day: string;
  animeList: ScheduleAnime[];
}

export interface EpisodeServer {
  title: string;
  serverId: string;
  href: string;
}

export interface EpisodeQuality {
  title: string;
  serverList: EpisodeServer[];
}

export interface EpisodeDetail {
  title: string;
  animeId: string;
  poster: string;
  releasedOn: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode: { title: string; episodeId: string; href: string } | null;
  hasNextEpisode: boolean;
  nextEpisode: { title: string; episodeId: string; href: string } | null;
  synopsis: { paragraphs: string[]; connections: string[] };
  genreList: GenreItem[];
  server: { qualities: EpisodeQuality[] };
}

export interface HomeData {
  recent: {
    animeList: AnimeListItem[];
  };
  batch: {
    batchList: unknown[];
  };
  movie: {
    animeList: AnimeListItem[];
  };
}

export interface SeriesDetail {
  title: string;
  poster: string;
  description: string;
  genres: string[];
  status: string;
  totalEpisodes: number;
  episodeList: { title: string; episodeId: string; href: string }[];
}

export interface FilmDetail {
  title: string;
  poster: string;
  description: string;
  genres: string[];
  status: string;
  duration: string;
  episodeList: { title: string; episodeId: string; href: string }[];
}
