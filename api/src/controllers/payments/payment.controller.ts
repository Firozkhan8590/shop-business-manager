import { Request, Response } from "express";
import { createCustomerPayment, createSupplierPayment, getAllPayments, getCustomerPayments, getSupplierPayments } from "../../services/payments/payment.sevice";




/* =========================================================
   CREATE CUSTOMER PAYMENT
========================================================= */

export async function addCustomerPayment(
  req: Request,
  res: Response
) {
  try {
    const {
      customerId,
      saleId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!paymentDate) {
      return res.status(400).json({
        success: false,
        message: "Payment date is required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount must be greater than zero",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }


    const payment =
      await createCustomerPayment(
        {
          customerId: Number(customerId),
          saleId: saleId
            ? Number(saleId)
            : null,
          paymentDate,
          amount: Number(amount),
          paymentMethod,
          referenceNumber:
            referenceNumber ?? null,
          notes: notes ?? null,
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Customer payment created successfully",
      data: payment,
    });
  } catch (error: any) {
    console.error(
      "Create customer payment error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create customer payment",
    });
  }
}


/* =========================================================
   CREATE SUPPLIER PAYMENT
========================================================= */

export async function addSupplierPayment(
  req: Request,
  res: Response
) {
  try {
    const {
      supplierId,
      purchaseId,
      paymentDate,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    if (!supplierId) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required",
      });
    }

    if (!paymentDate) {
      return res.status(400).json({
        success: false,
        message: "Payment date is required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount must be greater than zero",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    const payment =
      await createSupplierPayment(
        {
          supplierId: Number(supplierId),
          purchaseId: purchaseId
            ? Number(purchaseId)
            : null,
          paymentDate,
          amount: Number(amount),
          paymentMethod,
          referenceNumber:
            referenceNumber ?? null,
          notes: notes ?? null,
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Supplier payment created successfully",
      data: payment,
    });
  } catch (error: any) {
    console.error(
      "Create supplier payment error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create supplier payment",
    });
  }
}


/* =========================================================
   LIST ALL PAYMENTS
========================================================= */

export async function listPayments(
  req: Request,
  res: Response
) {
  try {
    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    if (
      date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const payments =
      await getAllPayments(date);

    return res.json({
      success: true,
      message: "Payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error(
      "List payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
}


/* =========================================================
   CUSTOMER PAYMENTS
========================================================= */

export async function listCustomerPayments(
  req: Request,
  res: Response
) {
  try {
    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    const payments =
      await getCustomerPayments(date);

    return res.json({
      success: true,
      message:
        "Customer payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error(
      "List customer payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer payments",
    });
  }
}


/* =========================================================
   SUPPLIER PAYMENTS
========================================================= */

export async function listSupplierPayments(
  req: Request,
  res: Response
) {
  try {
    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    const payments =
      await getSupplierPayments(date);

    return res.json({
      success: true,
      message:
        "Supplier payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error(
      "List supplier payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch supplier payments",
    });
  }
}