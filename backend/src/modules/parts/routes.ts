import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authenticate, authorize } from "../../middleware/auth";
import {
  listParts,
  getPartById,
  getPartBySerial,
  createPartController,
  updatePartById,
  deletePartById,
} from "./controller";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listParts));
router.get("/:id", asyncHandler(getPartById));
router.get("/serial/:serial", asyncHandler(getPartBySerial));
router.post("/", authorize("admin", "supervisor", "operator"), asyncHandler(createPartController));
router.patch("/:id", authorize("admin", "supervisor", "operator"), asyncHandler(updatePartById));
router.delete("/:id", authorize("admin"), asyncHandler(deletePartById));

export default router;
