import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import animeRouter from "./anime.js";
import docsRouter from "./docs.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(docsRouter);
router.use(animeRouter);

export default router;
