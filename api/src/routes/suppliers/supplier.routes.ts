import { Router } from "express";

import {
  addSupplier,
  editSupplier,
  getSupplier,
  listSuppliers,
  deactivateSupplierController,
} from "../../controllers/suppliers/supplier.controller";

import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "../../validators/suppliers/supplier.validator";

const router = Router();

// All supplier endpoints require admin authentication
router.use(authenticate);

// List suppliers / search suppliers
router.get("/", listSuppliers);

// Get single supplier
router.get("/:id", getSupplier);

// Create supplier
router.post(
  "/",
  validate(createSupplierSchema),
  addSupplier
);

// Update supplier
router.put(
  "/:id",
  validate(updateSupplierSchema),
  editSupplier
);

// Soft deactivate supplier
router.patch(
  "/:id/deactivate",
  deactivateSupplierController
);

export default router;