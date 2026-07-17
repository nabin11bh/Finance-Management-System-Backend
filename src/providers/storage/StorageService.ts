export interface UploadResult {
  storageKey: string;
  storageUrl: string;
  provider: string;
}

export interface StorageService {
  upload(file: Express.Multer.File, folder: string): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
  getFilePath?(storageKey: string): string; // local-only: for streaming downloads
}