import { Router } from "express";
import { getKpisHandler,getIncomeExpenseChartHandler,getIncomeByCategoryHandler,getExpenseByCategoryHandler,getMonthlyCashFlowHandler } from "./dashboard.controller";
import { authGuard } from "../../middleware/authGuard";


const router = Router();
router.use(authGuard);

router.get("/kpis", getKpisHandler);
router.get("/income-expense-chart", getIncomeExpenseChartHandler);
router.get("/income-by-category", getIncomeByCategoryHandler);
router.get("/expense-by-category", getExpenseByCategoryHandler);
router.get("/monthly-cash-flow", getMonthlyCashFlowHandler);

export default router;