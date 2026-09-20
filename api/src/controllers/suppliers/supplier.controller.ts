import { Request, Response } from "express";
import {
  createSupplier,
  deactivateSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
} from "../../services/suppliers/supplier.service";
import {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "../../types/suppliers/supplier.type";

export async function listSuppliers(
  req: Request,
  res: Response
) {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const suppliers = await getSuppliers(search);

    return res.json({
      success: true,
      message: "Suppliers fetched successfully",
      data: suppliers,
    });
  } catch (error) {
    console.error("List suppliers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers",
    });
  }
}

export async function getSupplier(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const supplier = await getSupplierById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.json({
      success: true,
      message: "Supplier fetched successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("Get supplier error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch supplier",
    });
  }
}

export async function addSupplier(
  req: Request,
  res: Response
) {
  try {
    const supplierData =
      req.body as CreateSupplierInput;

    const supplier =
      await createSupplier(supplierData);

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("Create supplier error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create supplier",
    });
  }
}

export async function editSupplier(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const existingSupplier =
      await getSupplierById(id);

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const supplierData =
      req.body as UpdateSupplierInput;

    const supplier = await updateSupplier(
      id,
      supplierData
    );

    return res.json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    console.error("Update supplier error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update supplier",
    });
  }
}

export async function deactivateSupplierController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const existingSupplier =
      await getSupplierById(id);

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const supplier =
      await deactivateSupplier(id);

    return res.json({
      success: true,
      message: "Supplier deactivated successfully",
      data: supplier,
    });
  } catch (error) {
    console.error(
      "Deactivate supplier error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate supplier",
    });
  }
}