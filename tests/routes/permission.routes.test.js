import request from "supertest";
import { app } from "../../app.js";
import db from "../../database/dbIndex.js";
import { businessFactory } from "../factories/business.factory.js";
import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import { alterUserVerification } from "../../services/user.services.js";
import hashIdUtil from "../../utils/hashId.util.js";

describe("Tests the permission controller and ownership", () => {
  beforeEach(async () => {
    await db.UserPermission.destroy({ where: {}, force: true });
    await db.User.destroy({ where: {}, force: true });
    await db.Business.destroy({ where: {}, force: true });
    //should create new bussiness
    //1.business
    //2.root account
    //3.reps
    //4.services
  });
  it("should try to access unauthorized resource protected route", async () => {});
});
