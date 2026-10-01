import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import sharp from "sharp";
import type { StorageEngine } from "multer";

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Only PNG, JPEG, WEBP, or GIF images are allowed"));
    return;
  }
  cb(null, true);
};

// Browse-page listing photos were shipping as raw, multi-megabyte phone
// camera uploads with no resizing or compression. This storage engine
// downsizes and re-encodes every upload before it hits disk, so the
// browse/listing pages stay fast regardless of what users upload.
// GIFs are passed through untouched to preserve animation.
function compressedStorage(maxDimension: number): StorageEngine {
  return {
    _handleFile(_req, file, cb) {
      if (file.mimetype === "image/gif") {
        const filename = `${crypto.randomUUID()}.gif`;
        const outPath = path.join(UPLOAD_DIR, filename);
        const writeStream = fs.createWriteStream(outPath);
        let size = 0;
        file.stream.on("data", (chunk) => (size += chunk.length));
        file.stream.pipe(writeStream);
        writeStream.on("finish", () => cb(null, { filename, path: outPath, size }));
        writeStream.on("error", cb);
        return;
      }

      const ext = file.mimetype === "image/png" ? "png" : file.mimetype === "image/webp" ? "webp" : "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const outPath = path.join(UPLOAD_DIR, filename);

      const transformer = sharp()
        .rotate()
        .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true });
      if (ext === "png") transformer.png({ quality: 80, compressionLevel: 9 });
      else if (ext === "webp") transformer.webp({ quality: 82 });
      else transformer.jpeg({ quality: 82, mozjpeg: true });

      const writeStream = fs.createWriteStream(outPath);
      let size = 0;
      const counted = transformer.on("data", (chunk) => (size += chunk.length));
      file.stream.pipe(counted).pipe(writeStream);
      writeStream.on("finish", () => cb(null, { filename, path: outPath, size }));
      writeStream.on("error", cb);
      transformer.on("error", cb);
    },
    _removeFile(_req, file, cb) {
      fs.unlink(file.path, cb);
    },
  };
}

export const uploadAvatar = multer({
  storage: compressedStorage(512),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const uploadListingImages = multer({
  storage: compressedStorage(1600),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: imageFileFilter,
});
