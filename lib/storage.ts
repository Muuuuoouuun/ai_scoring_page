import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(dataDir, filename);
  if (!existsSync(filePath)) return defaultValue;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return defaultValue;
  }
}

export function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
