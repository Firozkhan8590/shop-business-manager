import { Router } from "express";
import inventoryController from "../../controllers/inventory/inventory.controller";



const router = Router();

// router.use(authGuard);

// ==========================================
// IMPORTANT:
// Static routes MUST come before /:productId
// ==========================================



router.post(
    "/adjustment",
    inventoryController.adjustStock
);

router.post(
    "/return",
    inventoryController.addReturn
);

// ==========================================
// Inventory
// ==========================================

router.get(
    "/",
    inventoryController.getInventory
);

// ==========================================
// Product stock
// ==========================================

router.get(
    "/:productId",
    inventoryController.getProductStock
);

// ==========================================
// Movement history
// ==========================================

router.get(
    "/:productId/movements",
    inventoryController.getMovements
);

export default router;