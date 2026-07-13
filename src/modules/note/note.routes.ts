import { Router } from "express";
import {
  createNoteHandler,
  listNoteHandler,
  getNoteHandler,
  updateNoteHandler,
  deleteNoteHandler,
  togglePinHandler,
  toggleArchiveHandler,
} from "./note.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();
router.use(authGuard);

router.post("/", createNoteHandler);
router.get("/", listNoteHandler);
router.get("/:id", getNoteHandler);
router.patch("/:id", updateNoteHandler);
router.delete("/:id", deleteNoteHandler);
router.patch("/:id/pin", togglePinHandler);
router.patch("/:id/archive", toggleArchiveHandler);

export default router;