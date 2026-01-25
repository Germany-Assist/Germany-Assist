import { Router } from "express";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import { idHashedParamValidator } from "../../validators/general.validators.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
import variantController from "./variant.controller.js";
const variantRouter = Router();

variantRouter.put(
  "/provider/archiveVariant/:id",
  jwtUtils.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  variantController.archiveVariant,
);
variantRouter.post(
  "/provider/createNewVariant",
  jwtUtils.authenticateJwt,
  variantController.createNewVariant,
);
export default variantRouter;
