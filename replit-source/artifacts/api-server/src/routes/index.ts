import { Router, type IRouter } from "express";
import healthRouter from "./health";
import albumRouter from "./album";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(albumRouter);
router.use(messagesRouter);

export default router;
