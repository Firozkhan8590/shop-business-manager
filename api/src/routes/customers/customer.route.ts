import { Router } from "express";
import {
  addCustomer,
  editCustomer,
  getCustomer,
  listCustomers,
  removeCustomer,
} from "../../controllers/customers/customer.controller";
import { authenticate } from "../../middleware/auth";
import { createCustomerSchema, updateCustomerSchema } from "../../validators/products/customers/cutsomer.validator";
import { validate } from "../../middleware/validate";


const router = Router();

// All customer endpoints require admin authentication
router.use(authenticate);

// List customers / search customers
router.get("/", listCustomers);

// Get single customer
router.get("/:id", getCustomer);

// Create customer
router.post(
  "/",
  validate(createCustomerSchema),
  addCustomer
);

// Update customer
router.put(
  "/:id",
  validate(updateCustomerSchema),
  editCustomer
);

// Soft deactivate customer
router.patch(
  "/:id/deactivate",
  removeCustomer
);

export default router;