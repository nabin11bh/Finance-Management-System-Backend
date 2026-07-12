import { Router } from "express";
import { createIncomeHandler, listIncomeHandler, getIncomeHandler } from "./income.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();

router.use(authGuard); // every income route requires a logged-in user

router.post("/", createIncomeHandler);
router.get("/", listIncomeHandler);
router.get("/:id", getIncomeHandler);

export default router;