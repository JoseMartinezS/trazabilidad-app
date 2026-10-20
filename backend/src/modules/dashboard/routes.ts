import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authenticate } from "../../middleware/auth";
import { getDashboard } from "./controller";

const router = Router();

router.get("/test", authenticate, asyncHandler(getDashboard));

router.use(authenticate);

router.get("/", asyncHandler(getDashboard));

export default router;
