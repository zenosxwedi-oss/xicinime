import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/anime/docs", (_req, res) => {
  res.json({
    name: "Anime & Film API",
    version: "1.0.0",
    description: "API untuk anime, donghua, film, dan series. Data dari Sanka Vollerei / Winbu.",
    base_url: "/api",
    endpoints: [
      {
        method: "GET",
        path: "/api/anime/home",
        description: "Halaman utama — daftar anime terbaru",
      },
      {
        method: "GET",
        path: "/api/anime/search?q={query}&page={page}",
        description: "Cari anime/film/series berdasarkan judul",
        params: {
          q: "Kata kunci pencarian (wajib)",
          page: "Nomor halaman (default: 1)",
        },
      },
      {
        method: "GET",
        path: "/api/anime/detail/anime/:slug",
        description: "Detail anime berdasarkan slug",
        example: "/api/anime/detail/anime/my-gift-lvl-9999-unlimited-gacha",
      },
      {
        method: "GET",
        path: "/api/anime/detail/series/:slug",
        description: "Detail series/live-action berdasarkan slug",
        example: "/api/anime/detail/series/love-on-the-turquoise-land",
      },
      {
        method: "GET",
        path: "/api/anime/detail/film/:slug",
        description: "Detail film berdasarkan slug",
        example: "/api/anime/detail/film/resurrection-road-2025",
      },
      {
        method: "GET",
        path: "/api/anime/episode/:slug",
        description: "Daftar server/link download untuk satu episode",
        example: "/api/anime/episode/my-gift-lvl-9999-unlimited-gacha-episode-8",
      },
      {
        method: "GET",
        path: "/api/anime/server?post={post}&nume={nume}&type={type}",
        description: "Embed URL untuk pemutar video",
        params: {
          post: "ID post (wajib)",
          nume: "Nomor server (default: 1)",
          type: "Tipe server",
        },
        example: "/api/anime/server?post=66146&nume=1&type=schtml",
      },
      {
        method: "GET",
        path: "/api/anime/animedonghua?page={page}",
        description: "Daftar anime donghua (anime China)",
      },
      {
        method: "GET",
        path: "/api/anime/film?page={page}",
        description: "Daftar film",
      },
      {
        method: "GET",
        path: "/api/anime/series?page={page}",
        description: "Daftar series/live-action",
      },
      {
        method: "GET",
        path: "/api/anime/tvshow?page={page}",
        description: "Daftar TV show",
      },
      {
        method: "GET",
        path: "/api/anime/others?page={page}",
        description: "Daftar konten lainnya",
      },
      {
        method: "GET",
        path: "/api/anime/all-anime?page={page}",
        description: "Semua anime (urutan A-Z)",
      },
      {
        method: "GET",
        path: "/api/anime/all-anime-reverse?page={page}",
        description: "Semua anime (urutan Z-A)",
      },
      {
        method: "GET",
        path: "/api/anime/genres",
        description: "Daftar semua genre",
      },
      {
        method: "GET",
        path: "/api/anime/genre/:genre?page={page}",
        description: "Daftar anime berdasarkan genre",
        example: "/api/anime/genre/action",
      },
      {
        method: "GET",
        path: "/api/anime/catalog",
        description: "Katalog anime dengan filter",
        params: {
          title: "Filter judul",
          page: "Nomor halaman",
          order: "Urutan (contoh: update, popular)",
          type: "Tipe (contoh: TV, Movie, ONA)",
          status: "Status (contoh: Currently Airing, Completed)",
        },
        example: "/api/anime/catalog?title=one+piece&page=1&order=update&type=TV&status=Currently+Airing",
      },
      {
        method: "GET",
        path: "/api/anime/schedule?day={day}",
        description: "Jadwal rilis anime",
        params: {
          day: "Hari (senin/selasa/rabu/kamis/jumat/sabtu/minggu/acak/all)",
        },
        example: "/api/anime/schedule?day=senin",
      },
      {
        method: "GET",
        path: "/api/anime/update?page={page}",
        description: "Anime yang baru diperbarui",
      },
      {
        method: "GET",
        path: "/api/anime/latest?page={page}",
        description: "Anime terbaru",
      },
      {
        method: "GET",
        path: "/api/anime/ongoing?page={page}",
        description: "Anime yang sedang tayang",
      },
      {
        method: "GET",
        path: "/api/anime/completed?page={page}",
        description: "Anime yang sudah selesai",
      },
      {
        method: "GET",
        path: "/api/anime/popular?page={page}",
        description: "Anime terpopuler",
      },
      {
        method: "GET",
        path: "/api/anime/list",
        description: "Daftar anime dengan filter",
        params: {
          order: "Urutan (popular, update, dll)",
          status: "Status (ongoing, completed, movie)",
          type: "Tipe konten",
          page: "Nomor halaman",
        },
        example: "/api/anime/list?order=popular&status=ongoing&type=movie",
      },
    ],
  });
});

export default router;
