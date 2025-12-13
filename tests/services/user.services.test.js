import test, { describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import userServices from "../../src/modules/user/user.services.js";
import db from "../../src/database/dbIndex.js";
import bcryptUtil from "../../src/utils/bcrypt.util.js";
import { AppError } from "../../src/utils/error.class.js";

describe("testing User Services", () => {
  test("createUser() should call db.User.create with provided data", async (t) => {
    const createStub = sinon.stub(db.User, "create").resolves({ id: 1 });
    const userData = { email: "test@example.com" };
    const result = await userServices.createUser(userData);
    assert.deepEqual(result, { id: 1 });
    assert.ok(createStub.calledOnceWith(userData, sinon.match.object));
    createStub.restore();
  });

  test("createUserRole() should create a new user role", async (t) => {
    const createStub = sinon.stub(db.UserRole, "create").resolves({ id: 10 });
    const result = await userServices.createUserRole(1, "admin", "org", 2);
    assert.deepEqual(result, { id: 10 });
    assert.ok(createStub.calledOnce);
    createStub.restore();
  });

  test("loginUser() should throw if user not found", async (t) => {
    sinon.stub(db.User, "findOne").resolves(null);
    await assert.rejects(
      () => userServices.loginUser({ email: "x@test.com", password: "123" }),
      AppError
    );
    db.User.findOne.restore();
  });

  test("loginUser() should throw if password mismatch", async (t) => {
    sinon.stub(db.User, "findOne").resolves({ password: "hashedpass" });
    sinon.stub(bcryptUtil, "hashCompare").returns(false);
    await assert.rejects(
      () => userServices.loginUser({ email: "x@test.com", password: "123" }),
      AppError
    );
    db.User.findOne.restore();
    bcryptUtil.hashCompare.restore();
  });

  test("loginUser() should return user if credentials match", async (t) => {
    const fakeUser = { password: "hashed", id: 7 };
    sinon.stub(db.User, "findOne").resolves(fakeUser);
    sinon.stub(bcryptUtil, "hashCompare").returns(true);
    const result = await userServices.loginUser({
      email: "a@test.com",
      password: "abc",
    });
    assert.deepEqual(result, fakeUser);
    db.User.findOne.restore();
    bcryptUtil.hashCompare.restore();
  });

  test("getUserById() should throw if not found", async (t) => {
    sinon.stub(db.User, "findByPk").resolves(null);
    await assert.rejects(() => userServices.getUserById(99), AppError);
    db.User.findByPk.restore();
  });

  test("getUserById() should return user if found", async (t) => {
    sinon.stub(db.User, "findByPk").resolves({ id: 5 });
    const result = await userServices.getUserById(5);
    assert.deepEqual(result, { id: 5 });
    db.User.findByPk.restore();
  });

  test("userExists() should return true if user exists", async (t) => {
    sinon.stub(userServices, "getUserById").resolves({ id: 1 });
    const exists = await userServices.userExists(1);
    assert.equal(exists, true);
    userServices.getUserById.restore();
  });

  test("userExists() should return false if user not found", async (t) => {
    sinon.stub(userServices, "getUserById").rejects(new AppError());
    const exists = await userServices.userExists(2);
    assert.equal(exists, false);
    userServices.getUserById.restore();
  });

  test("updateUser() should throw if user not found", async (t) => {
    sinon.stub(db.User, "findByPk").resolves(null);
    await assert.rejects(() => userServices.updateUser(1, {}), AppError);
    db.User.findByPk.restore();
  });

  test("updateUser() should update and return user", async (t) => {
    const fakeUser = {
      update: sinon.stub().resolves({ id: 1, name: "updated" }),
    };
    sinon.stub(db.User, "findByPk").resolves(fakeUser);
    const result = await userServices.updateUser(1, { name: "updated" });
    assert.deepEqual(result, { id: 1, name: "updated" });
    db.User.findByPk.restore();
  });

  test("deleteUser() should throw if user not found", async (t) => {
    sinon.stub(db.User, "findByPk").resolves(null);
    await assert.rejects(() => userServices.deleteUser(1), AppError);
    db.User.findByPk.restore();
  });

  test("deleteUser() should destroy and return user", async (t) => {
    const fakeUser = { destroy: sinon.stub().resolves(), id: 3 };
    sinon.stub(db.User, "findByPk").resolves(fakeUser);
    const result = await userServices.deleteUser(3);
    assert.equal(result.id, 3);
    assert.ok(fakeUser.destroy.calledOnce);
    db.User.findByPk.restore();
  });

  test("alterUserVerification() should throw if user not found", async (t) => {
    sinon.stub(db.User, "findByPk").resolves(null);
    await assert.rejects(
      () => userServices.alterUserVerification(1, true),
      AppError
    );
    db.User.findByPk.restore();
  });

  test("alterUserVerification() should update verification status", async (t) => {
    const fakeUser = { update: sinon.stub().resolves({ is_verified: true }) };
    sinon.stub(db.User, "findByPk").resolves(fakeUser);
    const result = await userServices.alterUserVerification(1, true);
    assert.deepEqual(result, { is_verified: true });
    db.User.findByPk.restore();
  });

  test("getAllUsers() should return all users", async (t) => {
    const fakeUsers = [{ id: 1 }, { id: 2 }];
    sinon.stub(db.User, "findAll").resolves(fakeUsers);
    const result = await userServices.getAllUsers();
    assert.deepEqual(result, fakeUsers);
    db.User.findAll.restore();
  });

  test("getBusinessReps() should return representatives", async (t) => {
    const fakeReps = [{ id: 4 }];
    sinon.stub(db.User, "findAll").resolves(fakeReps);
    const result = await userServices.getBusinessReps(10);
    assert.deepEqual(result, fakeReps);
    db.User.findAll.restore();
  });

  test("getUserProfile() should return a user profile with relations", async (t) => {
    const fakeProfile = { id: 1, email: "x@test.com" };
    sinon.stub(db.User, "findByPk").resolves(fakeProfile);
    const result = await userServices.getUserProfile(1);
    assert.deepEqual(result, fakeProfile);
    db.User.findByPk.restore();
  });
});
