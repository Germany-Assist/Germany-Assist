import { sequelize } from "../../database/connection.js";
import db from "../../database/dbIndex.js";
import { AppError } from "../../utils/error.class.js";
import { errorLogger } from "../../utils/loggers.js";

export async function serviceFactory(overrides = {}) {
  const transaction = await sequelize.transaction();

  if (!overrides.service_provider_id && !overrides.user_id) {
    throw new AppError(400, "missing parameters for service factory");
  }

  try {
    const defaults = {
      title: "Full Stack Web Development Bootcamp",
      description: "Graduate with a portfolio of 5 real-world projects.",
      views: 4500,
      type: "service",
      total_reviews: 128,
      price: 4999.99,
      contract_id: null,
      image: "https://example.com/d.jpg",
    };

    const service = await db.Service.create(
      { ...defaults, ...overrides },
      { transaction }
    );

    if (overrides.categories?.length) {
      const categoryRecords = await db.Category.findAll({
        where: { title: overrides.categories },
        transaction,
      });
      await service.addCategories(categoryRecords, { transaction });
    }

    await transaction.commit();
    return service;
  } catch (error) {
    await transaction.rollback();
    errorLogger(error.message);
    throw error;
  }
}
