import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authenticate } from "../../middleware/auth";
import { getPartTraceability } from "./controller";

const router = Router();

router.use(authenticate);

router.get("/part/:partId", asyncHandler(getPartTraceability));

export default router;
