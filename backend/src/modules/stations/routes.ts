import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authenticate, authorize } from "../../middleware/auth";
import {
  listStations,
  getStationById,
  createStationController,
  updateStationById,
  deleteStationById,
} from "./controller";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listStations));
router.get("/:id", asyncHandler(getStationById));
router.post("/", authorize("admin", "supervisor"), asyncHandler(createStationController));
router.patch("/:id", authorize("admin", "supervisor"), asyncHandler(updateStationById));
router.delete("/:id", authorize("admin"), asyncHandler(deleteStationById));

export default router;
