import { test, describe, after, beforeEach, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../../src/app.js";
import {
  serviceProviderFactory,
  serviceProviderFullFactory,
} from "../factories/serviceProvider.factory.js";
import {
  userAdminFactory,
  userFactory,
  userWithTokenFactory,
} from "../factories/user.factory.js";
import {
  fullServiceFactory,
  serviceFactory,
} from "../factories/service.factory.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
import db from "../../src/database/index.js";
import { initDatabase } from "../../src/database/migrateAndSeed.js";
import { errorLogger } from "../../src/utils/loggers.js";

const API_PREFIX = "/api/service";

beforeEach(async () => {
  await initDatabase(false);
});
const dummyService = {
  title: "visa for everyone",
  description: "i manage travel visa processes for tourists.",
  price: 200,
  image: "https://example.com/service-images/travel-visa.jpg",
  category: "visa-paperwork",
  publish: true,
  timelineLabel: "iteration one",
};
const getService = async (filters) => {
  const service = await db.Service.findOne({ where: filters });
  if (service) return service.toJSON();
  return false;
};
after(async () => {
  try {
    await app?.close();
  } catch (error) {
    errorLogger(error);
  }
});
describe("/api/service   //   /* ---------------- Public Routes ---------------- */", () => {
  test("GET /api/service returns array and checking for pagination", async () => {
    for (let i = 0; i < 11; i++) {
      await fullServiceFactory();
    }
    await fullServiceFactory({ approved: false });
    await fullServiceFactory({ published: false });
    const res = await request(app).get(API_PREFIX);
    assert.equal(res.status, 200);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.limit, 10);
    assert.equal(res.body.total, 11);
    assert.equal(res.body.totalPages, 2);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 10);
    const page2 = await request(app)
      .get(API_PREFIX)
      .query("page=2")
      .expect(200);
    assert.equal(page2.status, 200);
    assert.equal(page2.body.page, 2);
    assert.equal(page2.body.limit, 10);
    assert.equal(page2.body.total, 11);
    assert.equal(page2.body.totalPages, 2);
    assert.ok(Array.isArray(page2.body.data));
    assert.equal(page2.body.data.length, 1);
  });
});
describe("api/service/:id - testing get by id for public", () => {
  it("should get the service profile by id", async () => {
    const as = await fullServiceFactory();
    const uas = await fullServiceFactory({ approved: false });
    const ups = await fullServiceFactory({ published: false });
    const asRes = await request(app)
      .get(`${API_PREFIX}/${hashIdUtil.hashIdEncode(as.service.id)}`)
      .send();
    //200 cuz its approved and published
    assert.equal(asRes.status, 200);
    const uasRes = await request(app)
      .get(`${API_PREFIX}/${hashIdUtil.hashIdEncode(uas.service.id)}`)
      .send();
    //404 due to unapproved service
    assert.equal(uasRes.status, 404);
    const upsRes = await request(app)
      .get(`${API_PREFIX}/${hashIdUtil.hashIdEncode(ups.service.id)}`)
      .send();
    //404 due to unpublished service
    assert.equal(upsRes.status, 404);
  });
});
describe("testing provider routes is services", () => {
  describe("api/service/provider - post - testing create new service route", () => {
    it("should create new service successfully", async () => {
      const sp = await serviceProviderFullFactory();
      const res = await request(app)
        .post("/api/service/provider")
        .set("Authorization", `Bearer ${sp.accessToken}`)
        .send(dummyService);
      assert.equal(res.status, 201);
      assert.ok(res.body.data.id);
      assert.ok(res.body.data.title);
      assert.ok(res.body.data.userId);
      assert.ok(res.body.data.categoryId);
      assert.ok(res.body.data.timelines);
      const serviceInDb = await getService({
        title: "visa for everyone",
        service_provider_id: sp.serviceProvider.id,
      });
      assert.ok(serviceInDb);
    });
    it("should fail to create new service for invalid category", async () => {
      const dummyService = {
        title: "visa for everyone",
        description: "i manage travel visa processes for tourists.",
        price: 200,
        image: "https://example.com/service-images/travel-visa.jpg",
        category: "mission impossible",
        publish: true,
        timelineLabel: "iteration one",
      };
      const sp = await serviceProviderFullFactory();
      const res = await request(app)
        .post("/api/service/provider")
        .set("Authorization", `Bearer ${sp.accessToken}`)
        .send(dummyService);
      assert.equal(res.status, 422);
      assert.deepEqual(res.body, {
        success: false,
        message: "invalid category",
      });
    });
    it("should fail to create new service for validation", async () => {
      const dummyService = {
        title: "",
        description: "",
        price: "",
        image: "",
        category: "",
        publish: "",
        timelineLabel: "",
      };
      const sp = await serviceProviderFullFactory();
      const res = await request(app)
        .post("/api/service/provider")
        .set("Authorization", `Bearer ${sp.accessToken}`)
        .send(dummyService);
      assert.equal(res.status, 422);
      assert.deepEqual(res.body.message.errors, [
        {
          type: "field",
          value: "",
          msg: "Title must be between 3 and 50 characters",
          path: "title",
          location: "body",
        },
        {
          type: "field",
          value: "",
          msg: "Description must be between 10 and 5000 characters",
          path: "description",
          location: "body",
        },
        {
          type: "field",
          value: "",
          msg: "Price must be a valid number and cannot be negative",
          path: "price",
          location: "body",
        },
        {
          type: "field",
          value: "",
          msg: "Category cannot be empty",
          path: "category",
          location: "body",
        },
        {
          type: "field",
          value: "",
          msg: "Image must be a valid URL",
          path: "image",
          location: "body",
        },
        {
          type: "field",
          value: "",
          msg: "Invalid value",
          path: "publish",
          location: "body",
        },
      ]);
    });
  });
  it("should retrieve all the service provider services", async () => {
    const sp = await serviceProviderFullFactory();
    const service_provider_id = sp.serviceProvider.id;
    const user_id = sp.user.id;
    await serviceFactory({
      service_provider_id,
      user_id,
      published: false,
    });
    await serviceFactory({
      service_provider_id,
      user_id,
      approved: false,
    });
    await serviceFactory({
      service_provider_id,
      user_id,
    });
    const res = await request(app)
      .get("/api/service/provider/services")
      .set("Authorization", `Bearer ${sp.accessToken}`);
    assert.ok(res.body);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.limit, 10);
    assert.equal(res.body.total, 3);
    assert.equal(res.body.totalPages, 1);
    assert.equal(res.body.data.length, 3);
  });

  it("should test publish/unpublish service", async () => {
    const SP = await serviceProviderFullFactory();
    const service = await serviceFactory({
      ...dummyService,
      user_id: SP.user.id,
      service_provider_id: SP.serviceProvider.id,
      published: false,
    });
    const serviceId = hashIdUtil.hashIdEncode(service.id);
    assert.strictEqual((await getService({ id: service.id })).published, false);
    await request(app)
      .put(API_PREFIX + "/provider/services/status")
      .set("Authorization", `Bearer ${SP.accessToken}`)
      .send({ id: serviceId, status: "publish" })
      .expect(200);
    assert.strictEqual((await getService({ id: service.id })).published, true);
    await request(app)
      .put(API_PREFIX + "/provider/services/status")
      .set("Authorization", `Bearer ${SP.accessToken}`)
      .send({ id: serviceId, status: "unpublish" })
      .expect(200);
    assert.strictEqual((await getService({ id: service.id })).published, false);
    const res = await request(app)
      .put(`${API_PREFIX}/provider/services/status`)
      .set("Authorization", `Bearer ${SP.accessToken}`)
      .send({ id: serviceId, status: "invalid" })
      .expect(422);
    assert.equal(res.body.message, "invalid status");
  });

  it("should update the service", async () => {
    const SP = await serviceProviderFullFactory();
    const service = await serviceFactory({
      ...dummyService,
      user_id: SP.user.id,
      service_provider_id: SP.serviceProvider.id,
    });
    const currentService = await getService({ id: service.id });
    assert.strictEqual(currentService.title, dummyService.title);
    const serviceId = hashIdUtil.hashIdEncode(currentService.id);
    const update = await request(app)
      .put(`${API_PREFIX}/provider/services`)
      .set("Authorization", `Bearer ${SP.accessToken}`)
      .send({ description: "Updated Service description", id: serviceId });
    assert.strictEqual(update.statusCode, 200);
    const updatedService = await getService({ id: service.id });
    assert.strictEqual(
      updatedService.description,
      "Updated Service description"
    );
  });
});

describe("testing service admin routes", () => {
  it("should test approve/reject", async () => {
    const { service, SP } = await fullServiceFactory({
      ...dummyService,
      approved: false,
      rejected: false,
    });
    const admin = await userAdminFactory();
    const serviceId = hashIdUtil.hashIdEncode(service.id);
    const pendingService = await getService({ id: service.id });
    assert.strictEqual(pendingService.approved, false);
    assert.strictEqual(pendingService.rejected, false);
    const res = await request(app)
      .put(API_PREFIX + "/admin/services/status")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ id: serviceId, status: "approve" })
      .expect(200);
    const approvedService = await getService({ id: service.id });
    assert.strictEqual(approvedService.approved, true);
    assert.strictEqual(approvedService.rejected, false);
    await request(app)
      .put(API_PREFIX + "/admin/services/status")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ id: serviceId, status: "reject" })
      .expect(200);
    const rejectedService = await getService({ id: service.id });
    assert.strictEqual(rejectedService.approved, false);
    assert.strictEqual(rejectedService.rejected, true);
  });
  it("should test delete and restore", async () => {
    const { service, SP } = await fullServiceFactory({
      ...dummyService,
      approved: false,
      rejected: false,
    });
    const serviceId = hashIdUtil.hashIdEncode(service.id);
    const admin = await userAdminFactory();
    //please note that the first restore will reject since its not deleted
    await request(app)
      .post(`${API_PREFIX}/admin/services/${serviceId}/restore`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(400);
    await request(app)
      .delete(`${API_PREFIX}/provider/services/${serviceId}`)
      .set("Authorization", `Bearer ${SP.accessToken}`)
      .expect(200);
    assert.strictEqual(await getService({ id: service.id }), false);
    await request(app)
      .post(`${API_PREFIX}/admin/services/${serviceId}/restore`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .expect(200);
    assert.ok(await getService({ id: service.id }));
  });
});

describe("testing service client routes ", () => {
  it("should test adding/removing to favorite", async () => {
    const { service, SP } = await fullServiceFactory({
      ...dummyService,
    });
    const client = await userWithTokenFactory();
    const serviceId = hashIdUtil.hashIdEncode(service.id);
    await request(app)
      .put(`/api/service/client/favorite/${serviceId}`)
      .set("Authorization", `Bearer ${client.accessToken}`)
      .expect(201);
    const res = await request(app)
      .delete(`/api/service/client/favorite/${serviceId}`)
      .set("Authorization", `Bearer ${client.accessToken}`)
      .expect(200);
  });
});
