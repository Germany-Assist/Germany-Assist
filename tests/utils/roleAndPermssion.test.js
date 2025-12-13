// auth.util.test.js
import test from "node:test";
import assert from "node:assert";
import sinon from "sinon";
import authUtil from "../../src/utils/authorize.util.js";
import db from "../../src/database/index.js";
import { validate as uuidValidate, version as uuidVersion } from "uuid";
import hashIdUtil from "../../src/utils/hashId.util.js";
import permissionServices from "../../src/modules/permission/permission.services.js";
import { AppError } from "../../src/utils/error.class.js";

test.describe("authUtil.checkRoleAndPermission", () => {
  test.afterEach(() => sinon.restore());

  test("throws if userId missing", async () => {
    await assert.rejects(
      () => authUtil.checkRoleAndPermission({}, ["admin"]),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "invalid parameters");
        return true;
      }
    );
  });

  test("throws if targetRoles missing", async () => {
    await assert.rejects(
      () => authUtil.checkRoleAndPermission({ id: 1 }, []),
      AppError
    );
  });

  test("throws if requirePermission without resource/action", async () => {
    await assert.rejects(
      () =>
        authUtil.checkRoleAndPermission(
          { id: 1 },
          ["admin"],
          true, // requirePermission
          null,
          null
        ),
      AppError
    );
  });

  test("throws if user not found", async () => {
    sinon.stub(permissionServices, "userAndPermission").resolves(null);

    await assert.rejects(
      () =>
        authUtil.checkRoleAndPermission(
          { id: 1, related_id: 10 },
          ["admin"],
          false
        ),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Invalid User");
        return true;
      }
    );
  });

  test("throws if improper role", async () => {
    const fakeUser = {
      UserRole: { role: "user", related_id: 10 },
      is_verified: true,
    };
    sinon.stub(permissionServices, "userAndPermission").resolves(fakeUser);

    await assert.rejects(
      () =>
        authUtil.checkRoleAndPermission(
          { id: 1, related_id: 10 },
          ["admin"], // doesn't include "user"
          false
        ),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Improper Role");
        return true;
      }
    );
  });

  test("throws if unverified user", async () => {
    const fakeUser = {
      UserRole: { role: "admin", related_id: 10 },
      is_verified: false,
    };
    sinon.stub(permissionServices, "userAndPermission").resolves(fakeUser);

    await assert.rejects(
      () =>
        authUtil.checkRoleAndPermission(
          { id: 1, related_id: 10 },
          ["admin"],
          false
        ),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Unverified User");
        return true;
      }
    );
  });

  test("throws if related_id mismatch", async () => {
    const fakeUser = {
      UserRole: { role: "admin", related_id: 99 },
      is_verified: true,
    };
    sinon.stub(permissionServices, "userAndPermission").resolves(fakeUser);

    await assert.rejects(
      () =>
        authUtil.checkRoleAndPermission(
          { id: 1, related_id: 10 },
          ["admin"],
          false
        ),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Manipulated token");
        return true;
      }
    );
  });

  test("throws if missing required permission", async () => {
    const fakeUser = {
      UserRole: { role: "admin", related_id: 10 },
      is_verified: true,
      userToPermission: [],
    };
    sinon.stub(permissionServices, "userAndPermission").resolves(fakeUser);

    await assert.rejects(
      () =>
        authUtil.checkRoleAndPermission(
          { id: 1, related_id: 10 },
          ["admin"],
          true,
          "service",
          "update"
        ),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Permission Denied");
        return true;
      }
    );
  });

  test("returns user if role and permission valid", async () => {
    const fakeUser = {
      UserRole: { role: "admin", related_id: 10 },
      is_verified: true,
      userToPermission: [{}],
    };
    sinon.stub(permissionServices, "userAndPermission").resolves(fakeUser);

    const user = await authUtil.checkRoleAndPermission(
      { id: 1, related_id: 10 },
      ["admin"],
      true,
      "service",
      "update"
    );

    assert.deepEqual(user, fakeUser);
  });
});

test.describe("authUtil.checkOwnership", () => {
  test.afterEach(() => sinon.restore());

  test("throws if targetId missing", async () => {
    await assert.rejects(
      () => authUtil.checkOwnership(null, 1, "Service"),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Missing Target Id");
        return true;
      }
    );
  });

  test("throws if ownerId missing", async () => {
    await assert.rejects(
      () => authUtil.checkOwnership(1, null, "Service"),
      AppError
    );
  });

  test("throws if resourceName missing", async () => {
    await assert.rejects(() => authUtil.checkOwnership(1, 2, null), AppError);
  });

  test("decodes hashId and checks ownership (generic resource)", async () => {
    sinon.stub(hashIdUtil, "hashIdDecode").returns(5);
    const fakeResource = { owner: 10 };
    db.Service = { findByPk: sinon.stub().resolves(fakeResource) };

    await assert.rejects(
      () => authUtil.checkOwnership("encoded5", 99, "Service"),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Unauthorized ownership");
        return true;
      }
    );
  });

  test("throws if resource not found", async () => {
    sinon.stub(hashIdUtil, "hashIdDecode").returns(5);
    db.Service = { findByPk: sinon.stub().resolves(null) };

    await assert.rejects(
      () => authUtil.checkOwnership(123, 10, "Service"),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Resource not found");
        return true;
      }
    );
  });

  test("returns subject if owner matches", async () => {
    sinon.stub(hashIdUtil, "hashIdDecode").returns(5);
    const fakeResource = { owner: 10 };
    db.Service = { findByPk: sinon.stub().resolves(fakeResource) };

    const subject = await authUtil.checkOwnership("encoded5", 10, "Service");

    assert.equal(subject, fakeResource);
  });

  test("checks User resource with UserRole relation", async () => {
    sinon.stub(hashIdUtil, "hashIdDecode").returns(5);
    const fakeUser = { UserRole: { related_id: 7 } };
    db.User = {
      findByPk: sinon.stub().resolves(fakeUser),
    };

    await assert.rejects(
      () => authUtil.checkOwnership("encoded5", 99, "User"),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "Unauthorized ownership");
        return true;
      }
    );
  });
});
