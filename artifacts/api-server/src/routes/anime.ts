import { Router, type IRouter, type Request, type Response } from "express";
import { proxyGet, proxyGetWithQuery } from "../lib/scraper.js";

const router: IRouter = Router();

function handleAsync(
  fn: (req: Request, res: Response) => Promise<void>
): (req: Request, res: Response) => void {
  return (req, res) => {
    fn(req, res).catch((err: unknown) => {
      req.log.error({ err }, "upstream error");
      res.status(502).json({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to fetch upstream data",
      });
    });
  };
}

router.get(
  "/anime/home",
  handleAsync(async (_req, res) => {
    const data = await proxyGet("/");
    res.json(data);
  })
);

router.get(
  "/anime/search",
  handleAsync(async (req, res) => {
    const q = String(req.query.q || "");
    const page = String(req.query.page || "1");
    if (!q) {
      res.status(400).json({ status: "error", message: "Query parameter 'q' is required" });
      return;
    }
    const data = await proxyGetWithQuery("/search", { q, page });
    res.json(data);
  })
);

router.get(
  "/anime/detail/anime/:slug",
  handleAsync(async (req, res) => {
    const data = await proxyGet(`/anime/${String(req.params.slug)}`);
    res.json(data);
  })
);

router.get(
  "/anime/detail/series/:slug",
  handleAsync(async (req, res) => {
    const data = await proxyGet(`/series/${String(req.params.slug)}`);
    res.json(data);
  })
);

router.get(
  "/anime/detail/film/:slug",
  handleAsync(async (req, res) => {
    const data = await proxyGet(`/film/${String(req.params.slug)}`);
    res.json(data);
  })
);

router.get(
  "/anime/episode/:slug",
  handleAsync(async (req, res) => {
    const data = await proxyGet(`/episode/${String(req.params.slug)}`);
    res.json(data);
  })
);

router.get(
  "/anime/server",
  handleAsync(async (req, res) => {
    const post = String(req.query.post || "");
    const nume = String(req.query.nume || "1");
    const type = String(req.query.type || "");
    if (!post) {
      res.status(400).json({ status: "error", message: "Query parameter 'post' is required" });
      return;
    }
    const data = await proxyGetWithQuery("/server", { post, nume, type });
    res.json(data);
  })
);

router.get(
  "/anime/animedonghua",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/animedonghua", { page });
    res.json(data);
  })
);

router.get(
  "/anime/film",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/film", { page });
    res.json(data);
  })
);

router.get(
  "/anime/series",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/series", { page });
    res.json(data);
  })
);

router.get(
  "/anime/tvshow",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/tvshow", { page });
    res.json(data);
  })
);

router.get(
  "/anime/others",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/others", { page });
    res.json(data);
  })
);

router.get(
  "/anime/all-anime",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/all-anime", { page });
    res.json(data);
  })
);

router.get(
  "/anime/all-anime-reverse",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/all-anime-reverse", { page });
    res.json(data);
  })
);

router.get(
  "/anime/genres",
  handleAsync(async (_req, res) => {
    const data = await proxyGet("/genres");
    res.json(data);
  })
);

router.get(
  "/anime/genre/:genre",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery(`/genre/${String(req.params.genre)}`, { page });
    res.json(data);
  })
);

router.get(
  "/anime/catalog",
  handleAsync(async (req, res) => {
    const params: Record<string, string | undefined> = {};
    if (req.query.title) params.title = String(req.query.title);
    if (req.query.page) params.page = String(req.query.page);
    if (req.query.order) params.order = String(req.query.order);
    if (req.query.type) params.type = String(req.query.type);
    if (req.query.status) params.status = String(req.query.status);
    const data = await proxyGetWithQuery("/catalog", params);
    res.json(data);
  })
);

router.get(
  "/anime/schedule",
  handleAsync(async (req, res) => {
    const day = String(req.query.day || "senin");
    const data = await proxyGetWithQuery("/schedule", { day });
    res.json(data);
  })
);

router.get(
  "/anime/update",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/update", { page });
    res.json(data);
  })
);

router.get(
  "/anime/latest",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/latest", { page });
    res.json(data);
  })
);

router.get(
  "/anime/ongoing",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/ongoing", { page });
    res.json(data);
  })
);

router.get(
  "/anime/completed",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/completed", { page });
    res.json(data);
  })
);

router.get(
  "/anime/popular",
  handleAsync(async (req, res) => {
    const page = String(req.query.page || "1");
    const data = await proxyGetWithQuery("/populer", { page });
    res.json(data);
  })
);

router.get(
  "/anime/list",
  handleAsync(async (req, res) => {
    const params: Record<string, string | undefined> = {};
    if (req.query.order) params.order = String(req.query.order);
    if (req.query.status) params.status = String(req.query.status);
    if (req.query.type) params.type = String(req.query.type);
    if (req.query.page) params.page = String(req.query.page);
    const data = await proxyGetWithQuery("/list", params);
    res.json(data);
  })
);

export default router;
