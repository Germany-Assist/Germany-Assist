import { sequelize } from "../database/connection.js";
import * as reviewServices from "../services/review.services.js";
import serviceServices from "../services/service.services.js";
import authUtil from "../utils/authorize.util.js";
import hashIdUtil from "../utils/hashId.util.js";

export async function createReview(req, res, next) {
  const t = await sequelize.transaction();
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const { body, rating } = req.body;
    const service_id = hashIdUtil.hashIdDecode(req.body.id);
    await reviewServices.canReview(req.auth.id, service_id);
    await reviewServices.createReview(
      {
        body,
        rating,
        service_id,
        user_id: req.auth.id,
      },
      t
    );
    res.sendStatus(201);
    //i can create a worker for this
    // flag
    await serviceServices.updateServiceRating(
      {
        serviceId: service_id,
        newRating: rating,
        isUpdate: false,
      },
      t
    );
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

export async function updateReview(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { body, rating } = req.body;
    const service_id = hashIdUtil.hashIdDecode(req.body.id);
    const oldRating = await reviewServices.updateReview(
      {
        body,
        rating,
        service_id,
        user_id: req.auth.id,
      },
      t
    );
    await serviceServices.updateServiceRating(
      {
        serviceId: service_id,
        newRating: rating,
        isUpdate: true,
        oldRating: oldRating,
      },
      t
    );
    res.sendStatus(200);
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
const reviewController = { updateReview, createReview };
export default reviewController;
