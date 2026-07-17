import { Router } from "express";
import { listAuditHandler } from "./audit.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();
router.use(authGuard);
router.get("/", listAuditHandler);

export default router;