import {
  test,
  describe,
  before,
  after,
  beforeEach,
  afterEach,
  it,
} from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../../app.js";
import {
  serviceProviderFactory,
  serviceProviderFullFactory,
} from "../factories/serviceProvider.factory.js";
import { sequelize } from "../../database/connection.js";
import seedPermissions from "../../database/seeds/permission_seed.js";
import seedCategory from "../../database/seeds/category_seed.js";
import {
  userAdminFactory,
  userWithTokenFactory,
} from "../factories/user.factory.js";
import { serviceFactory } from "../factories/service.factory.js";
import { getServiceId } from "../../controllers/service.controller.js";
import serviceServices from "../../services/service.services.js";
import hashIdUtil from "../../utils/hashId.util.js";
import db from "../../database/dbIndex.js";
import { getUserProfile } from "../../services/user.services.js";
import { title } from "node:process";

const API_PREFIX = "/api/service";
let SP, admin;

beforeEach(async () => {
  // Reset DB
  await sequelize.sync({ force: true });
  await seedPermissions();
  await seedCategory();
  SP = await serviceProviderFullFactory({ is_verified: true });
  admin = await userAdminFactory();
});
afterEach(async () => {
  //
});
after(async () => {
  await sequelize.close();
});
const serviceData = {
  title: "Full Stack Service",
  description: "A valid service description with enough length.",
  type: "service",
  price: 100,
  categories: ["visa-paperwork", "translation"],
};
const getServiceById = async (id) => {
  const service = await db.Service.findByPk(id);
  if (service) return service.toJSON();
  return false;
};
describe("E2E /api/service   //   /* ---------------- Public Routes ---------------- */", () => {
  test("GET /api/service returns array", async () => {
    const res = await request(app).get(API_PREFIX).expect(200);
    assert.ok(Array.isArray(res.body));
  });
  test("POST /api/service/categories returns filtered services", async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/categories`)
      .send({ categories: ["service"] })
      .expect(200);
    assert.ok(Array.isArray(res.body));
  });
});

//   /* ---------------- Provider Routes ---------------- */
test("POST /api/service fails validation on invalid input", async () => {
  const res = await request(app)
    .post(API_PREFIX)
    .set("Authorization", `Bearer ${SP.accessToken}`)
    .send({ title: "X", description: "short", type: "invalid", price: -1 });
  assert.strictEqual(res.statusCode, 422);
  assert.ok(res.body.errors);
});

test("POST /api/service creates a service publishes and approves It and retrieve it", async () => {
  const service = await request(app)
    .post(API_PREFIX)
    .set("Authorization", `Bearer ${SP.accessToken}`)
    .send({ ...serviceData, publish: true })
    .expect(201);
  assert.ok(await getServiceById(hashIdUtil.hashIdDecode(service.body.id)));
});

it("should update the service", async () => {
  const service = await serviceFactory({
    ...serviceData,
    user_id: SP.user.id,
    service_provider_id: SP.serviceProvider.id,
    published: true,
    approved: true,
  });
  const currentService = await getServiceById(service.id);

  assert.strictEqual(currentService.title, serviceData.title);
  const serviceId = hashIdUtil.hashIdEncode(currentService.id);

  const update = await request(app)
    .put(`${API_PREFIX}/provider/services`)
    .set("Authorization", `Bearer ${SP.accessToken}`)
    .send({ title: "Updated Service Title", id: serviceId });
  assert.strictEqual(update.statusCode, 200);

  const updatedService = await getServiceById(service.id);

  assert.strictEqual(updatedService.title, "Updated Service Title");
});

it("should test publish/unpublish service", async () => {
  const service = await serviceFactory({
    ...serviceData,
    user_id: SP.user.id,
    service_provider_id: SP.serviceProvider.id,
  });
  const serviceId = hashIdUtil.hashIdEncode(service.id);
  assert.strictEqual((await getServiceById(service.id)).published, false);
  await request(app)
    .put(API_PREFIX + "/provider/services/status")
    .set("Authorization", `Bearer ${SP.accessToken}`)
    .send({ id: serviceId, status: "publish" })
    .expect(200);
  assert.strictEqual((await getServiceById(service.id)).published, true);
  await request(app)
    .put(API_PREFIX + "/provider/services/status")
    .set("Authorization", `Bearer ${SP.accessToken}`)
    .send({ id: serviceId, status: "unpublish" })
    .expect(200);
  assert.strictEqual((await getServiceById(service.id)).published, false);
  const res = await request(app)
    .put(`${API_PREFIX}/provider/services/status`)
    .set("Authorization", `Bearer ${SP.accessToken}`)
    .send({ id: serviceId, status: "invalid" })
    .expect(422);
  assert.equal(res.body.message, "invalid status");
});

it("should test approve/reject", async () => {
  const service = await serviceFactory({
    ...serviceData,
    user_id: SP.user.id,
    service_provider_id: SP.serviceProvider.id,
  });
  const serviceId = hashIdUtil.hashIdEncode(service.id);
  const pendingService = await getServiceById(service.id);
  assert.strictEqual(pendingService.approved, false);
  assert.strictEqual(pendingService.rejected, false);
  await request(app)
    .put(API_PREFIX + "/admin/services/status")
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ id: serviceId, status: "approve" })
    .expect(200);
  const approvedService = await getServiceById(service.id);
  assert.strictEqual(approvedService.approved, true);
  assert.strictEqual(approvedService.rejected, false);
  await request(app)
    .put(API_PREFIX + "/admin/services/status")
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .send({ id: serviceId, status: "reject" })
    .expect(200);
  const rejectedService = await getServiceById(service.id);
  assert.strictEqual(rejectedService.approved, false);
  assert.strictEqual(rejectedService.rejected, true);
});

/* ---------------- Admin Routes ---------------- */
test("GET /api/service/admin/services returns array", async () => {
  await serviceFactory({
    ...serviceData,
    user_id: SP.user.id,
    service_provider_id: SP.serviceProvider.id,
  });
  const res = await request(app)
    .get(`${API_PREFIX}/admin/services`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .expect(200);
  assert.ok(Array.isArray(res.body));
  assert.strictEqual(res.body[0].approved, false);
  assert.strictEqual(res.body[0].rejected, false);
  assert.strictEqual(res.body[0].published, false);
});

it("should test delete and restore", async () => {
  const service = await serviceFactory({
    ...serviceData,
    user_id: SP.user.id,
    service_provider_id: SP.serviceProvider.id,
  });
  const serviceId = hashIdUtil.hashIdEncode(service.id);
  //please note that the first restore will reject since its not deleted
  await request(app)
    .post(`${API_PREFIX}/admin/services/${serviceId}/restore`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .expect(400);
  await request(app)
    .delete(`${API_PREFIX}/provider/services/${serviceId}`)
    .set("Authorization", `Bearer ${SP.accessToken}`)
    .expect(200);
  assert.strictEqual(await getServiceById(service.id), false);
  await request(app)
    .post(`${API_PREFIX}/admin/services/${serviceId}/restore`)
    .set("Authorization", `Bearer ${admin.accessToken}`)
    .expect(200);
  assert.ok(await getServiceById(service.id));
});

/* ---------------- Edge Cases ---------------- */
test("Unverified user cannot create service", async () => {
  const tempSP = await serviceProviderFactory();
  const unverifiedResult = await userWithTokenFactory({
    email: tempSP.email,
    UserRole: {
      role: "service_provider_root",
      related_type: "ServiceProvider",
      related_id: tempSP.id,
    },
  });
  const res = await request(app)
    .post(API_PREFIX)
    .set("Authorization", `Bearer ${unverifiedResult.accessToken}`)
    .send({
      title: "Test",
      description: "Test description",
      type: "service",
      price: 10,
      categories: ["cat1"],
    })
    .expect(403);
  assert.equal(res.body.message, "Unverified User");
});

test("Non-owner cannot update service", async () => {
  const tempSP = await serviceProviderFullFactory({ is_verified: true });
  const service = await serviceFactory({
    ...serviceData,
    user_id: SP.user.id,
    service_provider_id: SP.serviceProvider.id,
  });
  const serviceId = hashIdUtil.hashIdEncode(service.id);
  const res = await request(app)
    .put(`${API_PREFIX}/provider/services/`)
    .set("Authorization", `Bearer ${tempSP.accessToken}`)
    .send({ title: "Hacker Update", id: serviceId })
    .expect(403);
  assert.equal(res.body.message, "Unauthorized ownership");
});
describe("Testing Favorite/Cart", () => {
  let client,
    services = [];
  beforeEach(async () => {
    client = await userWithTokenFactory({ is_verified: true });
    for (let i = 0; i < 3; i++) {
      const service = await serviceFactory({
        ...serviceData,
        title: `im service number ${i}`,
        user_id: SP.user.id,
        service_provider_id: SP.serviceProvider.id,
      });
      services.push(service);
    }
  });

  it("should test adding/removing to favorite", async () => {
    await request(app)
      .post("/api/service/client/favorite")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send({ id: hashIdUtil.hashIdEncode(services[0].id) })
      .expect(201);
    await request(app)
      .post("/api/service/client/favorite")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send({ id: hashIdUtil.hashIdEncode(services[1].id) })
      .expect(201);

    const profile = (await getUserProfile(client.user.id)).toJSON();

    assert.ok(Array.isArray(profile.userFavorite));
    assert.strictEqual(profile.userFavorite.length, 2);

    await request(app)
      .delete("/api/service/client/favorite")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send({ id: hashIdUtil.hashIdEncode(services[0].id) })
      .expect(200);

    const profileUpdate = (await getUserProfile(client.user.id)).toJSON();

    assert.ok(Array.isArray(profileUpdate.userFavorite));
    assert.strictEqual(profileUpdate.userFavorite.length, 1);
  });

  it("should test adding/removing to cart", async () => {
    await request(app)
      .post("/api/service/client/cart")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send({ id: hashIdUtil.hashIdEncode(services[0].id) })
      .expect(201);
    await request(app)
      .post("/api/service/client/cart")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send({ id: hashIdUtil.hashIdEncode(services[1].id) })
      .expect(201);

    const profile = (await getUserProfile(client.user.id)).toJSON();

    assert.ok(Array.isArray(profile.userCart));
    assert.strictEqual(profile.userCart.length, 2);

    await request(app)
      .delete("/api/service/client/cart")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send({ id: hashIdUtil.hashIdEncode(services[0].id) })
      .expect(200);

    const profileUpdate = (await getUserProfile(client.user.id)).toJSON();

    assert.ok(Array.isArray(profileUpdate.userCart));
    assert.strictEqual(profileUpdate.userCart.length, 1);
  });
});
