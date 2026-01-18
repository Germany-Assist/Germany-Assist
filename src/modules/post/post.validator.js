import { body } from "express-validator";
import hashIdUtil from "../../utils/hashId.util.js";

export const createPostValidator = [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Description must be between 5 and 255 characters"),
  body("isPinned").optional().isBoolean(),
  body("timelineId")
    .notEmpty()
    .withMessage("service id cannot be empty")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),
];
