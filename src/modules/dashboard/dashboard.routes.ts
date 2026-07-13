import { Router } from "express";
import { getKpisHandler } from "./dashboard.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();
router.use(authGuard);

router.get("/kpis", getKpisHandler);

export default router;