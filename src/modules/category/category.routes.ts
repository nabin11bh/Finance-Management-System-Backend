import { Router } from "express";
import { listIncomeCategories, listExpenseCategories } from "./category.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();

router.get("/income-categories", authGuard, listIncomeCategories);
router.get("/expense-categories", authGuard, listExpenseCategories);

export default router;