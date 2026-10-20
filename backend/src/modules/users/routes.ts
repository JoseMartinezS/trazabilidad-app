import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authenticate, authorize } from "../../middleware/auth";
import {
  listUsers,
  getUserById,
  createUserController,
  updateUserById,
  deleteUserById,
} from "./controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "supervisor"), asyncHandler(listUsers));
router.get("/:id", authorize("admin", "supervisor"), asyncHandler(getUserById));
router.post("/", authorize("admin"), asyncHandler(createUserController));
router.patch("/:id", authorize("admin"), asyncHandler(updateUserById));
router.delete("/:id", authorize("admin"), asyncHandler(deleteUserById));

export default router;
