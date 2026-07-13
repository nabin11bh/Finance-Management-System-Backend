import { Router } from "express";
import {
  createExpenseHandler,
  listExpenseHandler,
  getExpenseHandler,
  updateExpenseHandler,
  deleteExpenseHandler,
} from "./expense.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();

router.use(authGuard);

router.post("/", createExpenseHandler);
router.get("/", listExpenseHandler);
router.get("/:id", getExpenseHandler);
router.patch("/:id", updateExpenseHandler);
router.delete("/:id", deleteExpenseHandler);

export default router;