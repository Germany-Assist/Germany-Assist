import {
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const S3_ENDPOINT = process.env.S3_ENDPOINT;

export const s3 = new S3Client({
  region: AWS_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});
export async function generateDownloadUrl(objectUrl) {
  const key = objectUrl.replace(`${S3_ENDPOINT}/${S3_BUCKET_NAME}/`, "");
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });
  return url;
}

export async function uploadImagesToS3(images) {
  const uploads = images.map((image) => {
    return s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: image.key,
        Body: image.buffer,
        ContentType: "image/webp",
      })
    );
  });
  await Promise.all(uploads);
}
export async function uploadVideoToS3(videos) {
  const uploads = videos.map((video) => {
    return s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: video.key,
        Body: video.buffer,
        ContentType: video.mimetype,
      })
    );
  });
  await Promise.all(uploads);
}
export async function uploadDocumentsToS3(documents) {
  const uploads = documents.map((document) => {
    return s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: document.key,
        Body: document.buffer,
        ContentType: document.mimetype,
      })
    );
  });
  await Promise.all(uploads);
}

export const listS3Assets = async (prefix = "") => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: prefix, // optional — e.g. "images/users/"
    });

    const response = await s3.send(command);

    // Each object is under Contents[]
    const files = response.Contents?.map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    }));

    return files || [];
  } catch (err) {
    console.error("Error listing S3 assets:", err);
    throw err;
  }
};
