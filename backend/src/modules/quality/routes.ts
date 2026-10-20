import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authenticate, authorize } from "../../middleware/auth";
import { createQualityCheck, getQualityForPart } from "./controller";

const router = Router();

router.use(authenticate);

router.post("/", authorize("admin", "supervisor", "operator"), asyncHandler(createQualityCheck));
router.get("/part/:partId", asyncHandler(getQualityForPart));

export default router;
