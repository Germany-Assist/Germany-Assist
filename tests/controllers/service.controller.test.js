import serviceServices from "../../services/service.services.js";
import sinon from "sinon";
import { afterEach, beforeEach, describe, it } from "node:test";

describe("Testing Service Controllers", () => {
  let sandBox;
  beforeEach(() => {
    sandBox = sinon.createSandbox();
  });

  afterEach(() => {
    sandBox.restore;
  });
  it("should create service successfully", async () => {});
});
