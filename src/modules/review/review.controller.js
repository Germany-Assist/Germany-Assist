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
    // TODO
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
//TODO this needs to be updated
export const getReviewByServiceId = async (req, res, next) => {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const serviceId = hashIdUtil.hashIdDecode(req.params.serviceId);
    await reviewServices.canReview(req.auth.id, serviceId);
    const reviewMapper = (review) => ({
      ...review,
      user: {
        name: `${review.user.firstName} ${review.user.lastName}`,
        id: hashIdUtil.hashIdEncode(review.user.id),
      },
    });
    const reviews = await reviewServices.getReviews(serviceId);
    res.status(200).send(reviews.map((r) => reviewMapper(r)));
  } catch (error) {
    next(error);
  }
};
export const getReviewByServiceIdForUser = async (req, res, next) => {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const serviceId = hashIdUtil.hashIdDecode(req.params.serviceId);
    const review = await reviewServices.getReviewForUser(
      serviceId,
      req.auth.id
    );
    res.status(200).send(review);
  } catch (error) {
    next(error);
  }
};
const reviewController = {
  updateReview,
  createReview,
  getReviewByServiceId,
  getReviewByServiceIdForUser,
};
export default reviewController;
