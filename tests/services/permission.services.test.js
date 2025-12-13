import { test, beforeEach, afterEach, describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import permissionServices from "../../src/modules/permission/permission.services.js";
import db from "../../src/database/dbIndex.js";
import { AppError } from "../../src/utils/error.class.js";

let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

//
// userAndPermission
//
describe("testing Permission services", () => {
  test("userAndPermission() should return user with permissions", async () => {
    const fakeUser = { id: 1, name: "John" };
    const stub = sandbox.stub(db.User, "findByPk").resolves(fakeUser);

    const result = await permissionServices.userAndPermission(
      1,
      "orders",
      "read"
    );

    assert.deepEqual(result, fakeUser);
    assert.ok(stub.calledOnce);
  });

  test("userAndPermission() should return false when user not found", async () => {
    sandbox.stub(db.User, "findByPk").resolves(null);

    const result = await permissionServices.userAndPermission(
      2,
      "orders",
      "write"
    );

    assert.equal(result, false);
  });

  //
  // adjustPermission
  //
  test("adjustPermission() should assign permission successfully", async () => {
    const fakePermission = { id: 10 };
    sandbox.stub(db.Permission, "findOne").resolves(fakePermission);
    const createStub = sandbox.stub(db.UserPermission, "create").resolves({});

    await permissionServices.adjustPermission(1, "create", "order", "assign");

    assert.ok(
      createStub.calledOnceWithExactly({
        user_id: 1,
        permission_id: 10,
      })
    );
  });

  test("adjustPermission() should revoke permission successfully", async () => {
    const fakePermission = { id: 20 };
    sandbox.stub(db.Permission, "findOne").resolves(fakePermission);
    const destroyStub = sandbox.stub(db.UserPermission, "destroy").resolves(1);

    await permissionServices.adjustPermission(1, "delete", "order", "revoke");

    assert.ok(
      destroyStub.calledOnceWithExactly({
        where: { user_id: 1, permission_id: 20 },
      })
    );
  });

  test("adjustPermission() should throw AppError if permission not found", async () => {
    sandbox.stub(db.Permission, "findOne").resolves(null);

    await assert.rejects(
      permissionServices.adjustPermission(1, "edit", "user", "assign"),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // initPermissions
  //
  test("initPermissions() should bulk create permissions successfully", async () => {
    const fakePermissions = [{ id: 1 }, { id: 2 }];
    const bulkStub = sandbox
      .stub(db.UserPermission, "bulkCreate")
      .resolves([{ id: 1 }, { id: 2 }]);
    sandbox.stub(db.Permission, "findAll").resolves(fakePermissions);

    const result = await permissionServices.initPermissions(
      1,
      [{ action: "read" }],
      {}
    );

    assert.equal(result, true);
    assert.ok(bulkStub.calledOnce);
  });

  test("initPermissions() should throw AppError if no permissions found", async () => {
    sandbox.stub(db.Permission, "findAll").resolves([]);

    await assert.rejects(
      permissionServices.initPermissions(1, [], {}),
      (err) =>
        err instanceof AppError &&
        err.httpCode === 500 &&
        err.message.includes("failed to find permissions")
    );
  });

  test("initPermissions() should throw AppError if bulkCreate fails", async () => {
    const fakePermissions = [{ id: 1 }];
    sandbox.stub(db.Permission, "findAll").resolves(fakePermissions);
    sandbox.stub(db.UserPermission, "bulkCreate").resolves([]);

    await assert.rejects(
      permissionServices.initPermissions(1, [{ action: "read" }], {}),
      (err) =>
        err instanceof AppError &&
        err.httpCode === 500 &&
        err.message.includes("failed to create permissions")
    );
  });

  //
  // getUserPermissions
  //
  test("getUserPermissions() should return user's permissions", async () => {
    const fakeUser = {
      userToPermission: [
        { action: "read", resource: "order" },
        { action: "create", resource: "user" },
      ],
    };
    sandbox.stub(db.User, "findOne").resolves(fakeUser);

    const result = await permissionServices.getUserPermissions(1);

    assert.deepEqual(result, fakeUser.userToPermission);
  });

  test("getUserPermissions() should handle user with no permissions", async () => {
    const fakeUser = { userToPermission: [] };
    sandbox.stub(db.User, "findOne").resolves(fakeUser);

    const result = await permissionServices.getUserPermissions(1);

    assert.deepEqual(result, []);
  });
});
