import { sequelize } from "../../configs/database.js";
import reviewServices from "./review.services.js";
import serviceServices from "../service/service.services.js";
import authUtil from "../../utils/authorize.util.js";
import hashIdUtil from "../../utils/hashId.util.js";

export async function createReview(req, res, next) {
  const t = await sequelize.transaction();
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const { body, rating } = req.body;
    const serviceId = hashIdUtil.hashIdDecode(req.body.id);
    await reviewServices.canReview(req.auth.id, serviceId);
    await reviewServices.createReview(
      {
        body,
        rating,
        serviceId,
        userId: req.auth.id,
      },
      t
    );
    res.sendStatus(201);
    //i can create a worker for this
    // flag
    await serviceServices.updateServiceRating(
      {
        serviceId: serviceId,
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
    const serviceId = hashIdUtil.hashIdDecode(req.body.id);
    const oldRating = await reviewServices.updateReview(
      {
        body,
        rating,
        serviceId,
        userId: req.auth.id,
      },
      t
    );
    await serviceServices.updateServiceRating(
      {
        serviceId: serviceId,
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
