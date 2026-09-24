import { Router } from "express";

import {
    getDashboard,
} from "../../controllers/dashboard/dashboard.controller";

const router = Router();

router.get(
    "/",
    getDashboard
);

export default router;