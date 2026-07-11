import { Router } from "express";
import { loginHandler, refreshHandler, logoutHandler } from "./auth.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();
router.post("/login", loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", authGuard, logoutHandler);

export default router;