import { body } from "express-validator";
import hashIdUtil from "../utils/hashId.util.js";

const allowedTypes = ["post", "comment"];
export const commentValidator = [
  body("body")
    .trim()
    .isString()
    .withMessage("comment body should only be text")
    .isLength({ max: 500, min: 2 })
    .withMessage("Comment body cannot exceed 500 characters"),
  body("relatedType")
    .isIn(allowedTypes)
    .withMessage("type can be either comment or post"),
  body("relatedId")
    .notEmpty()
    .withMessage("ID must be a valid id")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),
  ,
];
