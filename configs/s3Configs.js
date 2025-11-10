import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const S3_ENDPOINT = process.env.S3_ENDPOINT;

export const UploadConstrains = {
  userImage: {
    limit: 1,
    basekey: "/images/users/profile/",
    size: 3000,
    thumb: true,
  },
  serviceProviderProfileImage: {
    limit: 1,
    basekey: "/images/serviceProviders/profile/",
    size: 3000,
    thumb: true,
  },
  serviceProviderProfileGalleryImage: {
    limit: 5,
    basekey: "/images/serviceProviders/profile/gallery/",
    size: 3000,
    thumb: true,
  },
  serviceProviderProfileGalleryVideo: {
    limit: 1,
    basekey: "/videos/serviceProviders/profile/gallery/",
    size: 5000,
    thumb: true,
  },
  serviceProviderProfileDocument: {
    limit: 5,
    basekey: "/document/serviceProviders/profile/gallery/",
    size: 2000,
    thumb: false,
  },
  serviceProfileImage: {
    limit: 1,
    basekey: "/image/services/profile/",
    size: 3000,
    thumb: true,
  },
  serviceProfileGalleryImage: {
    limit: 5,
    basekey: "/image/services/profile/gallery/",
    size: 3000,
    thumb: true,
  },
  serviceProfileGalleryVideo: {
    limit: 1,
    basekey: "/video/services/profile/gallery/",
    size: 5000,
    thumb: false,
  },
  postAttachmentsFile: {
    limit: 1,
    basekey: "/file/post/attachments/",
    size: 5000,
    thumb: false,
  },
  postAttachmentsVideo: {
    limit: 1,
    basekey: "/video/post/attachments/",
    size: 10000,
    thumb: false,
  },
  postAttachmentsDocuments: {
    limit: 1,
    basekey: "/documents/post/attachments/",
    size: 3000,
    thumb: false,
  },
  postAttachmentsImage: {
    limit: 1,
    basekey: "/documents/post/attachments/",
    size: 3000,
    thumb: false,
  },
  assetImage: {
    limit: "*",
    basekey: "/assets/images/",
    size: 3000,
    thumb: false,
  },
  assetVideo: {
    limit: "*",
    basekey: "/assets/videos/",
    size: 3000,
    thumb: false,
  },
  assetDocument: {
    limit: "*",
    basekey: "/assets/documents/",
    size: 3000,
    thumb: false,
  },
};

export const s3 = new S3Client({
  region: AWS_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});
export async function uploadImagesToS3(images) {
  const uploads = images.map((image) => {
    return s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: image.key,
        Body: image.buffer,
        ContentType: "image/webp",
        ACL: "public-read",
      })
    );
  });
  await Promise.all(uploads);
}
