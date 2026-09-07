import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registrationsRouter from "./registrations";
import storageRouter from "./storage";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(registrationsRouter);
router.use(storageRouter);

export default router;
