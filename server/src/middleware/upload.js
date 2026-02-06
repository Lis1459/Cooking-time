import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const processImage = async (
  buffer,
  filename,
  width = null,
  height = null,
) => {
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, filename);
  let image = sharp(buffer);

  if (width || height) {
    image = image.resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  await image.jpeg({ quality: 80 }).toFile(filepath);
  return `/uploads/${filename}`;
};

export const uploadRecipeImage = upload.single("preview_image");
export const uploadStepImage = upload.single("step_image");
