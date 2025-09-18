import userServices from "../../services/user.services.js";
import db from "../../database/dbIndex.js";
import sinon from "sinon";
import { describe, it, beforeEach, afterEach, before, after } from "node:test";
import bcryptUtil from "../../utils/bcrypt.util.js";
import assert from "node:assert";
import { AppError } from "../../utils/error.class.js";

describe("Testing User Services", () => {
  let sandbox;
  let fakeMail = "test@test.com";
  let fakePassword = "Pass@ord";
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(bcryptUtil, "hashCompare").returns(true);
    sandbox
      .stub(db.User, "findOne")
      .resolves({ email: fakeMail, password: fakePassword });
  });
  afterEach(() => {
    sandbox.restore();
  });
  it("should Log User In", async () => {
    await userServices.loginUser({ email: fakeMail, password: fakePassword });
    sandbox.assert.calledOnce(db.User.findOne);
  });
  it("should throw a compare error", async () => {
    bcryptUtil.hashCompare.callsFake(() => false);
    await assert.rejects(async () => {
      await userServices.loginUser({ email: fakeMail, password: fakePassword });
    }, AppError);
    sandbox.assert.calledOnce(db.User.findOne);
  });
});
