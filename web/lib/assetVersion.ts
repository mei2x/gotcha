import fs from "fs";
import path from "path";

export function versionedAsset(publicPath: string): string {
  try {
    const fullPath = path.join(process.cwd(), "public", publicPath);
    const mtimeMs = fs.statSync(fullPath).mtimeMs;
    return `${publicPath}?v=${Math.round(mtimeMs)}`;
  } catch {
    return publicPath;
  }
}
