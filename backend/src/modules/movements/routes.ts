import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authenticate, authorize } from "../../middleware/auth";
import {
  createMovement,
  getMovementsForPart,
  listMovements,
} from "./controller";

const router = Router();

router.use(authenticate);

router.post("/", authorize("admin", "supervisor", "operator"), asyncHandler(createMovement));
router.get("/part/:partId", asyncHandler(getMovementsForPart));
router.get("/", asyncHandler(listMovements));

export default router;
