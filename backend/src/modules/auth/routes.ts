import { Router } from "express";
import asyncHandler from "express-async-handler";
import { authenticate, authorize } from "../../middleware/auth";
import { verifyOrigin } from "../../middleware/verifyOrigin";
import { loginLimiter, registerLimiter } from "../../middleware/rateLimit";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "./controller";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  authenticate,
  authorize("admin"),
  asyncHandler(registerUser)
);
router.post("/login", loginLimiter, asyncHandler(loginUser));
router.post("/refresh", verifyOrigin, asyncHandler(refreshToken));
router.post("/logout", verifyOrigin, logoutUser);

export default router;
