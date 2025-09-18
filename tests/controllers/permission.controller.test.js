// assignPermission.test.js
import test from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import permissionController from "../../controllers/permission.controller.js";
import { AppError } from "../../utils/error.class.js";
import authUtil from "../../utils/authorize.util.js";
import hashIdUtil from "../../utils/hashId.util.js";
import permissionServices from "../../services/permission.services.js";
import { roleTemplates } from "../../database/templates.js";

test("assignPermission works for valid request", async () => {
  const req = {
    auth: { role: "service_provider_root", related_id: "123" },
    body: { id: "encoded-42", action: "read", resource: "user" },
  };
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
  };
  const next = sinon.stub();
  sinon.stub(authUtil, "checkRoleAndPermission").resolves(true);
  sinon.stub(authUtil, "checkOwnership").resolves(true);
  sinon.stub(hashIdUtil, "hashIdDecode").returns(42);
  sinon.stub(permissionServices, "adjustPermission").resolves();
  roleTemplates.service_provider_root = [{ action: "read", resource: "user" }];
  await permissionController.assignPermission(req, res, next);
  assert(res.status.calledOnceWith(200));
  assert(
    res.json.calledOnceWithMatch({
      success: true,
      message: "Permission assigned successfully",
    })
  );
  sinon.restore();
});

test("assignPermission throws when no permission", async () => {
  const req = { auth: { role: "service_provider_root" }, body: {} };
  const res = {};
  const next = sinon.stub();

  sinon.stub(authUtil, "checkRoleAndPermission").resolves(false);

  await permissionController.assignPermission(req, res, next);

  assert(next.calledOnce);
  assert(next.firstCall.args[0] instanceof AppError);

  sinon.restore();
});
