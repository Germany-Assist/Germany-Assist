import multer from "multer";
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 6,
    fileSize: 15 * 1024 * 1024,
  },
});

export default multerUpload;
