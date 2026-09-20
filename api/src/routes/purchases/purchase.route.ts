import { Router } from "express";

import {
  addPurchase,
  editPurchase,
  getNextPurchaseNumberController,
  getPurchase,
  listPurchases,
} from "../../controllers/purchases/purchase.controller";

import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";

import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "../../validators/purchases/purchase.validator";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  listPurchases
);

router.get("/next-number", getNextPurchaseNumberController);
    
router.get(
  "/:id",
  getPurchase
);

router.post(
  "/",
  validate(createPurchaseSchema),
  addPurchase
);

router.put(
  "/:id",
  validate(updatePurchaseSchema),
  editPurchase
);

export default router;