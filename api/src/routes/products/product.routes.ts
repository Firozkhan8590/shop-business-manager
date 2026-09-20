import { Router } from "express";

import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deactivateProductController,
} from "../../controllers/products/product.controller";

import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { createProductSchema, updateProductSchema } from "../../validators/products/product.validator";



const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createProductSchema),
  createProductController
);

router.get("/", getProductsController);

router.get(
  "/:id",
  getProductByIdController
);

router.put(
  "/:id",
  validate(updateProductSchema),
  updateProductController
);

router.patch(
  "/:id/deactivate",
  deactivateProductController
);

export default router;