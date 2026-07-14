import { Router } from "express";
import {
  createReminderHandler,
  listReminderHandler,
  getReminderHandler,
  updateReminderHandler,
  deleteReminderHandler,
  markCompleteHandler,
} from "./reminder.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();
router.use(authGuard);

router.post("/", createReminderHandler);
router.get("/", listReminderHandler);
router.get("/:id", getReminderHandler);
router.patch("/:id", updateReminderHandler);
router.delete("/:id", deleteReminderHandler);
router.patch("/:id/complete", markCompleteHandler);

export default router;