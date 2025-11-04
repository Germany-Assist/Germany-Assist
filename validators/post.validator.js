import { body } from "express-validator";
import hashIdUtil from "../utils/hashId.util.js";

export const createPostValidator = [
  body("description")
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 5, max: 255 })
    .withMessage("Description must be between 5 and 255 characters"),
  body("serviceId")
    .notEmpty()
    .withMessage("service id cannot be empty")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),
  body("attachments")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Attachments must be an array")
    .custom((attachments) => {
      for (const item of attachments) {
        if (typeof item !== "object" || Array.isArray(item)) {
          throw new Error(
            "Attachments must be an array, Each attachment must be an object of key 'name' and key 'url' example {name:'addressForm',url:'form.drive.com'}"
          );
        }
        if (!item.url || typeof item.url !== "string") {
          throw new Error("Each attachment must include a valid 'url' string");
        }
        if (item.name && typeof item.name !== "string") {
          throw new Error("'name' in attachment must be a string if provided");
        }
      }
      return true;
    }),
];
