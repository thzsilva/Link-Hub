import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import profileRouter from "./profile";
import linksRouter from "./links";
import photosRouter from "./photos";
import analyticsRouter from "./analytics";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(profileRouter);
router.use(linksRouter);
router.use(photosRouter);
router.use(analyticsRouter);
router.use(adminRouter);

export default router;
