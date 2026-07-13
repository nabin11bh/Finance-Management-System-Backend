import { Router } from "express";
import { getKpisHandler,getIncomeExpenseChartHandler } from "./dashboard.controller";
import { authGuard } from "../../middleware/authGuard";


const router = Router();
router.use(authGuard);

router.get("/kpis", getKpisHandler);
router.get("/income-expense-chart", getIncomeExpenseChartHandler);

export default router;