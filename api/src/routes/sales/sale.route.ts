import { Router } from "express";

import {
  addSale,
  editSale,
  getSaleController,
  listSaleController,
  nextInvoiceNumber,
} from "../../controllers/sales/sale.controller";

import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";

import {
  createSaleSchema,
  updateSaleSchema,
} from "../../validators/sales/sale.validator";

const router = Router();

router.use(authenticate);

/*
 * IMPORTANT:
 * This must come before /:id
 */
router.get(
  "/next-number",
  nextInvoiceNumber
);

router.get(
  "/",
  listSaleController
);

router.get(
  "/:id",
  getSaleController
);

router.post(
  "/",
  validate(createSaleSchema),
  addSale
);

router.put(
  "/:id",
  validate(updateSaleSchema),
  editSale
);

export default router;