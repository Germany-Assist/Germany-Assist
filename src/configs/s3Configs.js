import {
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  ListBucketsCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const S3_ENDPOINT = process.env.S3_ENDPOINT;
export const S3_EXTERNAL_ENDPOINT = process.env.S3_EXTERNAL_ENDPOINT;

const SIGN_URL_EXPIRATION = Number(process.env.SIGN_URL_EXPIRATION || 600);

export const s3 = new S3Client({
  region: AWS_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Ensures bucket exists (LocalStack + AWS safe)
 */
async function ensureBucketExists(bucketName) {
  const response = await s3.send(new ListBucketsCommand({}));
  const exists = response.Buckets?.some((b) => b.Name === bucketName);

  if (!exists) {
    throw new Error(`S3 bucket "${bucketName}" does not exist`);
  }
}

/**
 * Unified upload function
 */
async function uploadFilesToS3(files) {
  await ensureBucketExists(S3_BUCKET_NAME);

  const uploads = files.map(async (file) => {
    if (!file.buffer) {
      throw new Error(`Missing buffer for file ${file.key}`);
    }
    return s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: file.key,
        Body: file.buffer,
        ContentType: file.mimetype || "application/octet-stream",
      })
    );
  });

  await Promise.all(uploads);
}

/**
 * Signed download URL
 */
export async function generateDownloadUrl(objectUrl, expireTime) {
  const key = objectUrl.replace(`${S3_ENDPOINT}/${S3_BUCKET_NAME}/`, "");

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: expireTime || SIGN_URL_EXPIRATION,
  });

  return S3_EXTERNAL_ENDPOINT
    ? url.replace(S3_ENDPOINT, S3_EXTERNAL_ENDPOINT)
    : url;
}

export const listS3Assets = async (prefix = "") => {
  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET_NAME,
    Prefix: prefix,
  });

  const response = await s3.send(command);
  return (
    response.Contents?.map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    })) || []
  );
};

export const deleteFromS3 = async (key) => {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    })
  );
};

export default {
  uploadFilesToS3,
  generateDownloadUrl,
  listS3Assets,
  deleteFromS3,
  S3_BUCKET_NAME,
  S3_ENDPOINT,
};
