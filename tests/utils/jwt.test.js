// auth.jwt.test.js
import test from "node:test";
import assert from "node:assert";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import jwtUtil from "../../src/middlewares/jwt.middleware.js";
import { AppError } from "../../src/utils/error.class.js";

test.describe("jwt.middleware", () => {
  test.afterEach(() => sinon.restore());

  // -----------------------
  // verifyRefreshToken (refresh)
  // -----------------------
  test("verifyRefreshToken - valid token", () => {
    const fakePayload = { id: 1 };
    sinon.stub(jwt, "verify").returns(fakePayload);

    const result = jwtUtil.verifyRefreshToken("validToken");

    assert.deepEqual(result, fakePayload);
  });

  test("verifyRefreshToken - invalid token throws AppError", () => {
    sinon.stub(jwt, "verify").throws(new Error("bad token"));

    assert.throws(
      () => jwtUtil.verifyRefreshToken("invalidToken"),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "invalid token");
        assert.equal(err.httpCode, 401);
        return true;
      }
    );
  });

  // -----------------------
  // verifyAccessToken
  // -----------------------
  test("verifyAccessToken - valid token", () => {
    const fakePayload = { id: 2 };
    sinon.stub(jwt, "verify").returns(fakePayload);

    const result = jwtUtil.verifyAccessToken("accessToken");

    assert.deepEqual(result, fakePayload);
  });

  test("verifyAccessToken - invalid token throws AppError", () => {
    sinon.stub(jwt, "verify").throws(new Error("jwt expired"));

    assert.throws(
      () => jwtUtil.verifyAccessToken("badAccess"),
      (err) => {
        assert(err instanceof AppError);
        assert.equal(err.message, "jwt expired");
        assert.equal(err.httpCode, 401);
        return true;
      }
    );
  });

  // -----------------------
  // generateAccessToken / generateRefreshToken
  // -----------------------
  const fakeUser = {
    id: 123,
    UserRole: {
      role: "admin",
      relatedType: "company",
      related_id: 55,
    },
  };

  test("generateAccessToken returns signed token", () => {
    sinon.stub(jwt, "sign").returns("signedAccessToken");

    const token = jwtUtil.generateAccessToken(fakeUser);

    assert.equal(token, "signedAccessToken");
    assert(jwt.sign.calledOnce);
    const [payload] = jwt.sign.firstCall.args;
    assert.deepEqual(payload, {
      id: 123,
      role: "admin",
      relatedType: "company",
      related_id: 55,
    });
  });

  test("generateRefreshToken returns signed token", () => {
    sinon.stub(jwt, "sign").returns("signedRefreshToken");

    const token = jwtUtil.generateRefreshToken(fakeUser);

    assert.equal(token, "signedRefreshToken");
    assert(jwt.sign.calledOnce);
  });

  test("generateTokens returns both tokens", () => {
    const signStub = sinon.stub(jwt, "sign");
    signStub.onCall(0).returns("accessX");
    signStub.onCall(1).returns("refreshX");

    const result = jwtUtil.generateTokens(fakeUser);

    assert.deepEqual(result, {
      accessToken: "accessX",
      refreshToken: "refreshX",
    });
  });
});
