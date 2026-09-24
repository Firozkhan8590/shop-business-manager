import { Router } from "express";

import {
    addEstimate,
    editEstimate,
    getEstimate,
    getNextEstimateNumberController,
    listEstimates,
    removeEstimate,
} from "../../controllers/estimates/estimate.controller";


const router = Router();

// ==========================================
// AUTHENTICATION
// ==========================================



// ==========================================
// NEXT ESTIMATE NUMBER
// IMPORTANT: Keep this before /:id
// ==========================================

router.get(
    "/next-number",
    getNextEstimateNumberController
);

// ==========================================
// LIST ESTIMATES
// ==========================================

router.get(
    "/",
    listEstimates
);

// ==========================================
// GET ESTIMATE BY ID
// ==========================================

router.get(
    "/:id",
    getEstimate
);

// ==========================================
// CREATE ESTIMATE
// ==========================================

router.post(
    "/",
    addEstimate
);

// ==========================================
// UPDATE ESTIMATE
// ==========================================

router.put(
    "/:id",
    editEstimate
);

// ==========================================
// DELETE ESTIMATE
// ==========================================

router.delete(
    "/:id",
    removeEstimate
);

export default router;