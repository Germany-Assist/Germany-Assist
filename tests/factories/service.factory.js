import { sequelize } from "../../src/configs/database.js";
import db from "../../src/database/index.js";
import { AppError } from "../../src/utils/error.class.js";
import { errorLogger } from "../../src/utils/loggers.js";
import { serviceProviderFullFactory } from "./serviceProvider.factory.js";
import { userWithTokenFactory } from "./user.factory.js";

export async function serviceFactory(overrides = {}) {
  const transaction = await sequelize.transaction();
  if (!overrides.service_provider_id || !overrides.user_id) {
    throw new AppError(400, "missing parameters for service factory");
  }
  const { id: catId } = (await db.Category.findAll())[0];
  try {
    const defaults = {
      title: "Full Stack Web Development Bootcamp",
      description: "Graduate with a portfolio of 5 real-world projects.",
      views: 4500,
      type: "service",
      published: true,
      approved: true,
      total_reviews: 128,
      type: "oneTime",
      price: 4999.99,
      image: "https://example.com/d.jpg",
      category_id: catId,
      Timelines: [{ label: "default" }],
    };
    const service = await db.Service.create(
      { ...defaults, ...overrides },
      { include: db.Timeline, transaction }
    );
    await transaction.commit();
    return service;
  } catch (error) {
    await transaction.rollback();
    errorLogger(error.message);
  }
}
export async function postFactory(overrides) {
  try {
    if (!overrides.user_id || !overrides.timeline_id)
      throw new Error("post factory failed missing user id or timeline id");
    const data = {
      description: "Post description for testing",
      attachments: [{ name: "background", url: "image/image.com" }],
      ...overrides,
    };
    return await db.Post.create(data);
  } catch (error) {
    errorLogger(error.message);
  }
}
export async function fullServiceFactory(overrides = {}) {
  try {
    const SP = await serviceProviderFullFactory(overrides);
    const service = await serviceFactory({
      service_provider_id: SP.serviceProvider.id,
      user_id: SP.user.id,
      approved: true,
      published: true,
      ...overrides,
    });
    const timeline_id = service.Timelines[0].id;
    return { service, timeline: service.Timelines[0], SP };
  } catch (error) {
    console.log(error);
  }
}
export async function fullPostFactory(overrides = {}) {
  try {
    const SP = await serviceProviderFullFactory();
    const service = await serviceFactory({
      service_provider_id: SP.serviceProvider.id,
      user_id: SP.user.id,
      approved: true,
      published: true,
    });
    const timeline_id = service.Timelines[0].id;
    const post = await postFactory({ timeline_id, user_id: SP.user.id });
    return { post, service, timeline: service.Timelines[0], SP };
  } catch (error) {
    console.log(error);
  }
}
