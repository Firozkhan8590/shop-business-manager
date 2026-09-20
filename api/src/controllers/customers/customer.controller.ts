import { Request, Response } from "express";
import {
  createCustomer,
  deactivateCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../../services/customers/customer.service";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../../types/customers/customer.type";

export async function listCustomers(
  req: Request,
  res: Response
) {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const customers = await getCustomers(search);

    return res.json({
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    console.error("List customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
}

export async function getCustomer(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await getCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
}

export async function addCustomer(
  req: Request,
  res: Response
) {
  try {
    const customerData =
      req.body as CreateCustomerInput;

    const customer =
      await createCustomer(customerData);

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
}

export async function editCustomer(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const existingCustomer =
      await getCustomerById(id);

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customerData =
      req.body as UpdateCustomerInput;

    const customer = await updateCustomer(
      id,
      customerData
    );

    return res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
}

export async function removeCustomer(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const existingCustomer =
      await getCustomerById(id);

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer =
      await deactivateCustomer(id);

    return res.json({
      success: true,
      message: "Customer deactivated successfully",
      data: customer,
    });
  } catch (error) {
    console.error(
      "Deactivate customer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate customer",
    });
  }
}