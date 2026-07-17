import multer from "multer";
import { env } from "../config/env";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export const upload = multer({
  storage: multer.memoryStorage(), // buffer in memory, then handed to StorageService — works for both Local and Cloudinary providers
  limits: { fileSize: env.MAX_ATTACHMENT_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("UNSUPPORTED_FILE_TYPE"));
    }
  },
});