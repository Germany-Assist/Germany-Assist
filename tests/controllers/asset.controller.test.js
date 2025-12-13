// tests/upload.controller.test.mjs
import { beforeEach, afterEach, test } from "node:test";
import assert from "node:assert";
import sinon from "sinon";

import uploadController from "../../src/modules/assets/assets.controller.js";
import assetServices from "../../src/modules/assets/asset.services.js";
import s3Utils from "../../src/configs/s3Configs.js";
import sharpUtil from "../../src/utils/sharp.util.js";
import authUtil from "../../src/utils/authorize.util.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
import db from "../../src/database/index.js";
import { AppError } from "../../src/utils/error.class.js";

let sandbox;
let req;
let res;
let next;

beforeEach(() => {
  sandbox = sinon.createSandbox();

  req = {
    auth: { id: 11, related_id: 99, roles: ["service_provider_root"] },
    params: { id: "HASHED" },
    query: {},
    body: {},
    file: undefined,
    files: undefined,
  };

  res = {
    status: sandbox.stub().returnsThis(),
    send: sandbox.stub().returnsThis(),
    json: sandbox.stub().returnsThis(),
  };

  next = sandbox.stub();

  // stub external modules' methods used by controller and helpers
  sandbox.stub(assetServices, "extractConstrains");
  sandbox.stub(assetServices, "countAssetsInDatabase");
  sandbox.stub(assetServices, "createAssets");
  sandbox.stub(assetServices, "getAllAssets");
  sandbox.stub(assetServices, "deleteAsset");

  sandbox.stub(s3Utils, "uploadImagesToS3");
  sandbox.stub(s3Utils, "uploadVideoToS3");
  sandbox.stub(s3Utils, "uploadDocumentsToS3");
  sandbox.stub(s3Utils, "generateDownloadUrl");
  sandbox.stub(s3Utils, "listS3Assets");
  // endpoint and bucket values for formatUrls
  s3Utils.S3_ENDPOINT = "https://s3.endpoint";
  s3Utils.S3_BUCKET_NAME = "my-bucket";

  sandbox.stub(sharpUtil, "imageResizeS3");

  sandbox.stub(authUtil, "checkRoleAndPermission");
  sandbox.stub(authUtil, "checkOwnership");

  sandbox.stub(hashIdUtil, "hashIdDecode");

  // db.Post.findByPk
  if (db && db.Post) {
    sandbox.stub(db.Post, "findByPk");
  }
});

afterEach(() => {
  sandbox.restore();
});

// -----------------------------
// Helpers: formatVideosToS3
// -----------------------------
test("formatVideosToS3: creates video objects with ext, mimetype, size and id", () => {
  const files = [
    {
      originalname: "movie.mp4",
      buffer: Buffer.from("AAA"),
      mimetype: "video/mp4",
    },
    {
      originalname: "clip.webm",
      buffer: Buffer.from("BBBB"),
      mimetype: "video/webm",
    },
  ];
  const constrains = { basekey: "videos" };
  const arr = uploadController.formatVideosToS3(
    files,
    "serviceProfileVideo",
    constrains
  );

  assert.strictEqual(arr.length, 2);
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    assert.ok(item.key.startsWith("videos/"));
    assert.ok(item.key.endsWith(pathExt(files[i].originalname)));
    assert.strictEqual(item.mimetype, files[i].mimetype);
    assert.strictEqual(item.size, files[i].buffer.length);
    assert.strictEqual(item.thumb, false);
    assert.strictEqual(item.type, "serviceProfileVideo");
  }
});

function pathExt(name) {
  // small helper to get extension used in controller
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx) : "";
}

// -----------------------------
// Helpers: formatDocumentToS3
// -----------------------------
test("formatDocumentToS3: creates document objects with ext, mimetype, size and id", () => {
  const files = [
    {
      originalname: "doc.pdf",
      buffer: Buffer.from("PDFDATA"),
      mimetype: "application/pdf",
    },
  ];
  const constrains = { basekey: "docs" };
  const arr = uploadController.formatDocumentToS3(
    files,
    "postAttachmentsDocuments",
    constrains
  );

  assert.strictEqual(arr.length, 1);
  const doc = arr[0];
  assert.ok(doc.key.startsWith("docs/"));
  assert.ok(doc.key.endsWith(".pdf"));
  assert.strictEqual(doc.mimetype, "application/pdf");
  assert.strictEqual(doc.size, files[0].buffer.length);
  assert.strictEqual(doc.type, "postAttachmentsDocuments");
});

// -----------------------------
// Helpers: formatImagesToS3 (thumb true and false)
// -----------------------------
test("formatImagesToS3: when thumb=true returns image + thumb entries", async () => {
  const files = [
    { originalname: "pic.jpg", buffer: Buffer.from("IMAGE_DATA") },
  ];
  const constrains = { basekey: "images", thumb: true };
  // stub resize to produce different size buffers for full and thumb
  sharpUtil.imageResizeS3.resolves(Buffer.from("RESIZED"));

  const arr = await uploadController.formatImagesToS3(
    files,
    "typeX",
    constrains
  );

  // two entries: image and thumb
  assert.strictEqual(arr.length, 2);
  const [img, thumb] = arr;
  assert.ok(img.key.includes("images/") && img.key.endsWith(".webp"));
  assert.strictEqual(img.type, "typeX");
  assert.strictEqual(img.thumb, false);
  assert.ok(thumb.key.includes("images/thumb/") && thumb.thumb === true);
  assert.strictEqual(img.size, Buffer.from("RESIZED").length);
});

test("formatImagesToS3: when thumb=false returns single image entry", async () => {
  const files = [{ originalname: "p2.png", buffer: Buffer.from("X") }];
  const constrains = { basekey: "images2", thumb: false };
  sharpUtil.imageResizeS3.resolves(Buffer.from("R2"));

  const arr = await uploadController.formatImagesToS3(
    files,
    "typeY",
    constrains
  );
  assert.strictEqual(arr.length, 1);
  assert.strictEqual(arr[0].thumb, false);
  assert.ok(arr[0].key.endsWith(".webp"));
});

// -----------------------------
// formatUrls & formatForAssets
// -----------------------------
test("formatUrls should build S3 urls using s3Utils endpoint and bucket", () => {
  const input = [
    { key: "k/1.webp", type: "t", thumb: false, id: "ID1", size: 123 },
  ];
  const out = uploadController.formatUrls(input);
  assert.strictEqual(out.length, 1);
  assert.strictEqual(
    out[0].url,
    `${s3Utils.S3_ENDPOINT}/${s3Utils.S3_BUCKET_NAME}/${input[0].key}`
  );
  assert.strictEqual(out[0].id, "ID1");
});

test("formatForAssets converts urls into DB asset entries", () => {
  const urls = [{ id: "ID", size: 10, type: "X", url: "u", thumb: false }];
  const auth = { id: 5, related_id: 77 };
  const assets = uploadController.formatForAssets({
    urls,
    auth,
    mediaType: "image",
    postId: 1,
    serviceId: 2,
  });
  assert.strictEqual(assets.length, 1);
  const a = assets[0];
  assert.strictEqual(a.user_id, 5);
  assert.strictEqual(a.service_provider_id, 77);
  assert.strictEqual(a.post_id, 1);
  assert.strictEqual(a.service_id, 2);
  assert.strictEqual(a.media_type, "image");
  assert.strictEqual(a.name, "ID");
});

// -----------------------------
// formatSearchFilters — serviceProvider, service, post, user, default throw
// -----------------------------
test("formatSearchFilters: ownerType serviceProvider sets service_provider_id", () => {
  const constrains = { ownerType: "serviceProvider" };
  const filters = uploadController.formatSearchFilters(
    "type",
    { related_id: 500 },
    {},
    constrains
  );
  assert.strictEqual(filters.service_provider_id, 500);
  assert.strictEqual(filters.key, "type");
});

test("formatSearchFilters: ownerType service sets service_id via hash decode and provider id", () => {
  hashIdUtil.hashIdDecode.returns(1234);
  const constrains = { ownerType: "service" };
  const filters = uploadController.formatSearchFilters(
    "type",
    { related_id: 777 },
    { id: "h" },
    constrains
  );
  assert.strictEqual(filters.service_id, 1234);
  assert.strictEqual(filters.service_provider_id, 777);
});

test("formatSearchFilters: ownerType post sets post_id via hash decode and provider id", () => {
  hashIdUtil.hashIdDecode.returns(4000);
  const constrains = { ownerType: "post" };
  const filters = uploadController.formatSearchFilters(
    "t",
    { related_id: 11 },
    { id: "p" },
    constrains
  );
  assert.strictEqual(filters.post_id, 4000);
  assert.strictEqual(filters.service_provider_id, 11);
});

test("formatSearchFilters: ownerType user sets user_id", () => {
  const constrains = { ownerType: "user" };
  const filters = uploadController.formatSearchFilters(
    "t",
    { id: 21 },
    {},
    constrains
  );
  assert.strictEqual(filters.user_id, 21);
});

test("formatSearchFilters: invalid owner type throws AppError", () => {
  assert.throws(
    () =>
      uploadController.formatSearchFilters("t", {}, {}, { ownerType: "bad" }),
    (err) => err instanceof AppError
  );
});

// -----------------------------
// validateAndSizeCount — error cases and success
// -----------------------------
test("validateAndSizeCount: throws if limit/type/size missing", async () => {
  const files = [{ buffer: Buffer.from("A") }];
  const constrains = { limit: undefined, size: 100 };
  await assert.rejects(
    async () => {
      await uploadController.validateAndSizeCount(
        "type",
        files,
        {},
        constrains
      );
    },
    (err) => err instanceof AppError
  );
});

test("validateAndSizeCount: passes when within limits", async () => {
  const files = [{ buffer: Buffer.from("OK") }];
  const constrains = { limit: 10, size: 1000 };
  assetServices.countAssetsInDatabase.resolves(0);
  await uploadController.validateAndSizeCount("type", files, {}, constrains);
  // no throw -> success
});

// -----------------------------
// uploadService — image / video / document / default
// -----------------------------

test("uploadService: video branch uses formatVideosToS3 and uploadVideoToS3", async () => {
  assetServices.extractConstrains.resolves({
    mediaType: "video",
    limit: 10,
    size: "*",
    basekey: "vb",
    ownerType: "user",
  });
  const filesToUpload = [
    { key: "vb/xyz.mp4", type: "videoType", id: "vid1", size: 5 },
  ];
  const formatVid = sandbox
    .stub(uploadController, "formatVideosToS3")
    .returns(filesToUpload);
  s3Utils.uploadVideoToS3.resolves(true);
  assetServices.createAssets.resolves(true);
  s3Utils.generateDownloadUrl.resolves("signed-video");

  const resu = await uploadController.uploadService(
    "vt",
    [{ buffer: Buffer.from("x") }],
    { id: 1, related_id: 2 },
    { ownerType: "user" }
  );
  assert.strictEqual(resu[0].url, "signed-video");
  assert.ok(formatVid.calledOnce);
});

test("uploadService: document branch uses formatDocumentToS3 and uploadDocumentsToS3", async () => {
  assetServices.extractConstrains.resolves({
    mediaType: "document",
    limit: 10,
    size: "*",
    basekey: "db",
    ownerType: "user",
  });
  const filesToUpload = [
    { key: "db/f.pdf", type: "docType", id: "doc1", size: 2 },
  ];
  sandbox.stub(uploadController, "formatDocumentToS3").returns(filesToUpload);
  s3Utils.uploadDocumentsToS3.resolves(true);
  assetServices.createAssets.resolves(true);
  s3Utils.generateDownloadUrl.resolves("signed-doc");

  const out = await uploadController.uploadService(
    "d",
    [{ buffer: Buffer.from("x") }],
    { id: 2, related_id: 3 },
    {}
  );
  assert.strictEqual(out[0].url, "signed-doc");
});

test("uploadService: throws AppError when constrains.mediaType unknown", async () => {
  assetServices.extractConstrains.resolves({
    mediaType: "nonsense",
    limit: 1,
    size: "*",
  });
  await assert.rejects(
    async () => {
      await uploadController.uploadService(
        "t",
        [{ buffer: Buffer.from("x") }],
        { id: 1 },
        {}
      );
    },
    (err) => err instanceof AppError
  );
});

// -----------------------------
// Controller methods: getAllAssets & getAllExistingAssets
// -----------------------------
test("getAllAssets: success path", async () => {
  authUtil.checkRoleAndPermission.resolves(true);
  assetServices.getAllAssets.resolves([{ name: "a" }]);

  await uploadController.getAllAssets(req, res, next);
  assert.ok(res.send.calledOnceWith([{ name: "a" }]));
});

test("getAllExistingAssets: success path", async () => {
  authUtil.checkRoleAndPermission.resolves(true);
  s3Utils.listS3Assets.resolves([{ key: "k" }]);

  await uploadController.getAllExistingAssets(req, res, next);
  assert.ok(res.send.calledOnceWith([{ key: "k" }]));
});

// -----------------------------
// deleteAssetClient / deleteAsset / deleteAssetsOfSp
// -----------------------------
test("deleteAssetClient: constructs correct filters and calls deleteAsset", async () => {
  req.params.name = "n1";
  req.auth = { id: 55 };
  authUtil.checkRoleAndPermission.resolves(true);
  assetServices.deleteAsset.resolves(true);

  await uploadController.deleteAssetClient(req, res, next);
  assert.ok(assetServices.deleteAsset.calledOnce);
  assert.ok(res.status.calledWith(200));
  assert.ok(res.send.calledOnce);
});

test("deleteAsset: admin path", async () => {
  req.params.name = "x";
  authUtil.checkRoleAndPermission.resolves(true);
  assetServices.deleteAsset.resolves(true);

  await uploadController.deleteAsset(req, res, next);
  assert.ok(assetServices.deleteAsset.calledOnce);
  assert.ok(res.status.calledWith(200));
});

test("deleteAssetsOfSp: service provider path uses related_id", async () => {
  req.params.name = "m";
  req.auth = { related_id: 234 };
  authUtil.checkRoleAndPermission.resolves(true);
  assetServices.deleteAsset.resolves(true);

  await uploadController.deleteAssetsOfSp(req, res, next);
  assert.ok(assetServices.deleteAsset.calledOnce);
  const calledWith = assetServices.deleteAsset.getCall(0).args[0];
  assert.strictEqual(calledWith.service_provider_id, 234);
});

// -----------------------------
// uploadFilesForService: missing file and success path
// -----------------------------
test("uploadFilesForService: returns 400 when no file or files present", async () => {
  const handler = uploadController.uploadFilesForService("svcImg");
  // req.file and req.files undefined
  await handler(req, res, next);
  assert.ok(res.status.calledWith(400));
  assert.ok(res.json.calledOnce);
});

test("uploadFilesForService: success calls uploadService and responds", async () => {
  const handler = uploadController.uploadFilesForService("svcImg");
  // prepare req with single file (req.file)
  req.file = { originalname: "a.jpg", buffer: Buffer.from("X") };
  req.files = undefined;
  req.auth = { related_id: 12, id: 33, roles: ["service_provider_root"] };

  authUtil.checkRoleAndPermission.resolves(true);
  authUtil.checkOwnership.resolves(true);

  // stub uploadService internal method exported on controller
  sandbox
    .stub(uploadController, "uploadService")
    .resolves([{ id: "u1", url: "signed" }]);

  await handler(req, res, next);

  assert.ok(uploadController.uploadService.calledOnce);
  assert.ok(res.json.calledOnce);
  const payload = res.json.getCall(0).args[0];
  assert.strictEqual(payload.message, "File uploaded successfully");
  assert.ok(Array.isArray(payload.publicUrls));
});

// -----------------------------
// uploadFilesForPost: authorisation check with DB
// -----------------------------
test("uploadFilesForPost: when db returns null throws AppError and next called", async () => {
  const handler = uploadController.uploadFilesForPost("postAttachmentsImage");
  req.file = { originalname: "a.jpg", buffer: Buffer.from("1") };
  req.auth = { related_id: 50 };

  authUtil.checkRoleAndPermission.resolves(true);
  hashIdUtil.hashIdDecode.returns(1000);
  db.Post.findByPk.resolves(null);

  await handler(req, res, next);
  assert.ok(next.calledOnce);
  const err = next.getCall(0).args[0];
  assert.ok(err instanceof Error);
});

test("uploadFilesForPost: success path calls uploadService and responds", async () => {
  const handler = uploadController.uploadFilesForPost("postAttachmentsImage");
  req.file = { originalname: "a.jpg", buffer: Buffer.from("1") };
  req.auth = { related_id: 50, id: 3 };
  req.params = { id: "h" };

  authUtil.checkRoleAndPermission.resolves(true);
  hashIdUtil.hashIdDecode.returns(22);
  // db find returns truthy (authorized)
  db.Post.findByPk.resolves({ id: 22 });

  sandbox.stub(uploadController, "uploadService").resolves([{ url: "u" }]);

  await handler(req, res, next);

  assert.ok(uploadController.uploadService.calledOnce);
  assert.ok(res.json.calledOnce);
});

// -----------------------------
// uploadFilesForSpProfile / uploadFilesForAdmins / updateUserProfileImage
// -----------------------------
test("uploadFilesForSpProfile: returns 400 when no file", async () => {
  const handler = uploadController.uploadFilesForSpProfile("spProfile");
  // no file
  await handler(req, res, next);
  assert.ok(res.status.calledWith(400));
});

test("uploadFilesForSpProfile: success path", async () => {
  const handler = uploadController.uploadFilesForSpProfile("spProfile");
  req.file = { originalname: "b.jpg", buffer: Buffer.from("B") };
  req.auth = { related_id: 1, id: 2 };
  authUtil.checkRoleAndPermission.resolves(true);
  sandbox.stub(uploadController, "uploadService").resolves([{ url: "u1" }]);

  await handler(req, res, next);
  assert.ok(res.json.calledOnce);
});

test("uploadFilesForAdmins: missing type/role behavior (400 if no file)", async () => {
  const handler = uploadController.uploadFilesForAdmins("assetImage");
  await handler(req, res, next);
  assert.ok(res.status.calledWith(400));
});

test("updateUserProfileImage: requires roles and returns success when file present", async () => {
  const handler = uploadController.updateUserProfileImage("userImage");
  req.file = { originalname: "avatar.png", buffer: Buffer.from("A") };
  req.auth = { id: 9, related_id: null };
  authUtil.checkRoleAndPermission.resolves(true);
  sandbox.stub(uploadController, "uploadService").resolves([{ url: "u" }]);

  await handler(req, res, next);
  assert.ok(res.json.calledOnce);
});

// -----------------------------
// signUrl
// -----------------------------
test("signUrl: calls generateDownloadUrl and returns signed url", async () => {
  authUtil.checkRoleAndPermission.resolves(true);
  s3Utils.generateDownloadUrl.resolves("signed-xyz");

  req.body = { url: "somekey", expire: 120 };

  await uploadController.signUrl(req, res, next);
  assert.ok(s3Utils.generateDownloadUrl.calledOnceWith("somekey", 120));
  assert.ok(res.status.calledWith(200));
  const payload = res.send.getCall(0).args[0];
  assert.strictEqual(payload.success, true);
  assert.strictEqual(payload.message.url, "signed-xyz");
});
