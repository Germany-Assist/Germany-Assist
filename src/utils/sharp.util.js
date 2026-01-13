import sharp from "sharp";

export async function imageResizeS3(image, x, y) {
  const resizedImageBuffer = await sharp(image.buffer)
    .resize(x, y, {
      fit: "inside",
    })
    .webp({ quality: 80 })
    .toBuffer();
  return resizedImageBuffer;
}

const sharpUtil = {
  imageResizeS3,
};
export default sharpUtil;
