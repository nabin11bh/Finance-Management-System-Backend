import { Router } from "express";
import { uploadHandler, listHandler, deleteHandler, downloadHandler } from "./attachment.controller";
import { authGuard } from "../../middleware/authGuard";
import { upload } from "../../middleware/upload";

const router = Router();
router.use(authGuard);

router.post("/:entityType/:entityId", upload.array("files", 10), uploadHandler);
router.get("/:entityType/:entityId", listHandler);
router.delete("/:id", deleteHandler);
router.get("/file/:id", downloadHandler);

export default router;