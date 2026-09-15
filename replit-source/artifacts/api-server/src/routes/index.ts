import { Router, type IRouter } from "express";
import healthRouter from "./health";
import albumRouter from "./album";

const router: IRouter = Router();

router.use(healthRouter);
router.use(albumRouter);

export default router;
