import { Router } from "express";

import {
  loginController,
  logoutController,
} from "../controllers/auth.controller";

import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", loginController);

router.post(
  "/logout",
  authenticate,
  logoutController
);

export default router;