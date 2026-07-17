import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "../../config/env";
import { StorageService, UploadResult } from "./StorageService";

export class LocalStorageProvider implements StorageService {
  private basePath = path.resolve(env.LOCAL_UPLOAD_PATH);

  async upload(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const folderPath = path.join(this.basePath, folder);
    fs.mkdirSync(folderPath, { recursive: true });

    const storageKey = `${folder}/${randomUUID()}${path.extname(file.originalname)}`;
    const fullPath = path.join(this.basePath, storageKey);
    fs.writeFileSync(fullPath, file.buffer);

    return {
      storageKey,
      storageUrl: `/api/v1/attachments/file/${encodeURIComponent(storageKey)}`,
      provider: "local",
    };
  }

  async delete(storageKey: string): Promise<void> {
    const fullPath = path.join(this.basePath, storageKey);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }

  getFilePath(storageKey: string): string {
    return path.join(this.basePath, storageKey);
  }
}