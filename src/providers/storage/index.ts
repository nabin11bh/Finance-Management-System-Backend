import { StorageService } from "./StorageService";
import { LocalStorageProvider } from "./LocalStorageProvider";

let instance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!instance) instance = new LocalStorageProvider();
  return instance;
}