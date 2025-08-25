import * as serviceServices from "../../services/service.services.js";
import sinon from "sinon";
import { it, before, after, describe, beforeEach, afterEach } from "node:test";
import db from "../../database/dbIndex.js";
import authUtils from "../../utils/authorize.requests.util.js";
import { where } from "sequelize";
describe("Should Service Services", () => {
  let sandBox;
  beforeEach(() => {
    sandBox = sinon.createSandbox();
    sandBox.stub(authUtils, "checkRoleAndPermission").resolves({ user: 1 });
    sandBox.stub(authUtils, "checkOwnership").resolves({ subject: 1 });
  });
  afterEach(() => {
    sandBox.restore();
  });
  it("should Get Service By Id", async () => {
    let fakeId = 1;
    const fakeService = {
      datavalues: {},
      increment: sandBox.stub(),
      save: sandBox.stub(),
      get: sandBox.stub(),
    };
    const findOneStub = sandBox
      .stub(db.Service, "findOne")
      .resolves(fakeService);

    await serviceServices.getServiceById(fakeId);
    sandBox.assert.calledOnce(findOneStub);
    sandBox.assert.calledWith(findOneStub);
    sandBox.assert.calledWith(
      findOneStub,
      sinon.match({
        where: { id: fakeId, approved: true, rejected: false, published: true },
      })
    );
    sandBox.assert.calledOnce(fakeService.increment);
    sandBox.assert.calledOnce(fakeService.save);
  });
});
