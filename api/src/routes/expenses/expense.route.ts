import { Router } from "express";
import expenseController from "../../controllers/expenses/expense.controller";


const router = Router();


// Create
router.post("/", expenseController.create);

// List
router.get("/", expenseController.getAll);

// Get details
router.get("/:id", expenseController.getById);

// Update
router.put("/:id", expenseController.update);

// Delete
router.delete("/:id", expenseController.delete);

export default router;