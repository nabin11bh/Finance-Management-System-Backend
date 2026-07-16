import { Router } from "express";
import { incomeReportHandler, expenseReportHandler, profitLossReportHandler } from "./report.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();
router.use(authGuard);

router.get("/income", incomeReportHandler);
router.get("/expense", expenseReportHandler);
router.get("/profit-loss", profitLossReportHandler);

export default router;