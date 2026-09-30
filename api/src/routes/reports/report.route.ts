import { Router } from "express";

import {
  salesReportController,
  purchasesReportController,
  customerPaymentsReportController,
  supplierPaymentsReportController,
  outstandingReportController,
  productSalesReportController,
  productPurchasesReportController,
  stockMovementsReportController,
  profitReportController
} from "../../controllers/reports/report.controller";

import expenseReportController from "../../controllers/reports/expense-report.controller";

import { authenticate } from "../../middleware/auth";

const router = Router();

/* ============================================================
   AUTHENTICATION
============================================================ */

router.use(authenticate);

/* ============================================================
   SALES REPORT
============================================================ */

router.get(
  "/sales",
  salesReportController
);

router.get(
  "/purchases",
  purchasesReportController
);

router.get(
  "/customer-payments",
  customerPaymentsReportController
);

router.get(
  "/supplier-payments",
  supplierPaymentsReportController
);

router.get(
  "/outstanding",
  outstandingReportController
);

router.get(
  "/product-sales",
  productSalesReportController
);

router.get(
  "/product-purchases",
  productPurchasesReportController
);

router.get(
  "/stock-movements",
  stockMovementsReportController
);

router.get(
  "/expenses",
  expenseReportController.getReport
);

router.get(
  "/profit",
  profitReportController
);

export default router;