import sharp from "sharp";

export const imageResizeS3 = async (image, x, y) => {
  const resizedImageBuffer = await sharp(image.buffer)
    .resize(x, y)
    .webp({ quality: 80 })
    .toBuffer();
  return resizedImageBuffer;
};
