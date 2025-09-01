import fs from "fs";
import path from "path";

// Remove directory recursively
export async function rmrf(targetPath) {
  if (!targetPath) return;
  try {
    await fs.promises.rm(targetPath, { recursive: true, force: true });
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

// Safe path join (prevents zip-slip attacks)
export function safeJoin(base, target) {
  const resolvedPath = path.resolve(base, target);
  if (!resolvedPath.startsWith(path.resolve(base))) {
    throw new Error("Unsafe path detected (zip slip attempt)");
  }
  return resolvedPath;
}

// Ensure directory exists
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Get extension of a file in lowercase
export function extOf(filePath) {
  return path.extname(filePath).toLowerCase();
}

// Check if file is a zip
export function isZip(filePath) {
  return extOf(filePath) === ".zip";
}
