import { Router } from "express";
import { addCustomerPayment, addSupplierPayment, listCustomerPayments, listPayments, listSupplierPayments } from "../../controllers/payments/payment.controller";



const router = Router();


/* =========================================================
   ALL PAYMENTS
========================================================= */

router.get("/", listPayments);


/* =========================================================
   CUSTOMER PAYMENTS
========================================================= */

router.post(
  "/customer",
  addCustomerPayment
);

router.get(
  "/customer",
  listCustomerPayments
);


/* =========================================================
   SUPPLIER PAYMENTS
========================================================= */

router.post(
  "/supplier",
  addSupplierPayment
);

router.get(
  "/supplier",
  listSupplierPayments
);


export default router;