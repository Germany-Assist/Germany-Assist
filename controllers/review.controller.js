import { sequelize } from "../database/connection.js";
import * as reviewServices from "../services/review.services.js";
import serviceServices from "../services/service.services.js";
import authUtil from "../utils/authorize.util.js";
import { AppError } from "../utils/error.class.js";
import hashIdUtil from "../utils/hashId.util.js";

export async function createReview(req, res, next) {
  const t = await sequelize.transaction();

  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    //i guess in the future should have owner ship meaning you cant review a not requested service
    const { body, rating } = req.body;
    const service_id = hashIdUtil.hashIdDecode(req.body.id);
    await reviewServices.createReview(
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
        isUpdate: false,
      },
      t
    );
    res.sendStatus(201);
    await t.commit();
  } catch (error) {
    await t.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      next(
        new AppError(
          400,
          "review already exists",
          true,
          "review already exists"
        )
      );
    } else {
      next(error);
    }
  }
}

export async function getReviewsByServiceId(req, res, next) {
  try {
    const service_id = hashIdUtil.hashIdDecode(req.params.serviceId);
    const reviews = await reviewServices.getReviewsByServiceId(service_id);
    const sanitizedReviews = reviews.map((i) => {
      return {
        body: i.body,
        rating: i.rating,
        userName: i.User.fullName,
        user_id: hashIdUtil.hashIdEncode(i.User.id),
      };
    });
    res.status(200).json(sanitizedReviews);
  } catch (error) {
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
const reviewController = { updateReview, getReviewsByServiceId, createReview };
export default reviewController;
// export async function deleteReview(req, res, next) {
//   try {
//     const deleted = await reviewServices.deleteReview(req.params.id);
//     res.sendStatus(200);
//   } catch (error) {
//     next(error);
//   }
// }
// export async function restoreReview(req, res, next) {
//   try {
//     const deleted = await reviewServices.restoreReview(req.params.id);
//     res.sendStatus(200);
//   } catch (error) {
//     next(error);
//   }
// }
