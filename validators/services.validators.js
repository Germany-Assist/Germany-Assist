import { body, param } from "express-validator";

// Validation for creating a new service
export const createServiceValidator = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("Title must be between 3 and 50 characters"),

  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  body("user_id")
    .isInt({ min: 1 })
    .withMessage("UserId must be an integer greater than 0"),

  body("service_provider_id")
    .isUUID(4)
    .withMessage("Service provider ID must be a valid UUIDv4"),

  body("type")
    .isIn(["product", "service", "subscription"])
    .withMessage("Type must be one of: product, service, subscription"),

  body("price")
    .isInt({ min: 0 })
    .withMessage("Price must be a valid number and cannot be negative"),

  body("image").optional().isURL().withMessage("Image must be a valid URL"),

  body("approved").optional().isBoolean(),
  body("rejected").optional().isBoolean(),
];

// Validation for updating a service
export const updateServiceValidator = [
  param("id").notEmpty().withMessage("Service ID param is required"),
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("Title must be between 3 and 50 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  body("type")
    .optional()
    .isIn(["product", "service", "subscription"])
    .withMessage("Type must be one of: product, service, subscription"),

  body("price")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Price must be a valid number and cannot be negative"),

  body("image").optional().isURL().withMessage("Image must be a valid URL"),
];
