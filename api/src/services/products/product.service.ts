import db from "../../config/database";

import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../../types/products/product.type";

// ==========================================
// CREATE PRODUCT
// ==========================================

export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  return db.transaction(async (trx) => {
    const initialStock = Number(
      data.current_stock ?? 0
    );

    // ------------------------------------------
    // 1. Create product
    // ------------------------------------------

    const [product] = await trx("products")
      .insert({
        category_id: data.category_id ?? null,
        name: data.name,
        sku: data.sku ?? null,
        barcode: data.barcode ?? null,
        unit: data.unit ?? "pcs",

        purchase_price: String(
          data.purchase_price ?? 0
        ),

        selling_price: String(
          data.selling_price ?? 0
        ),

        current_stock: String(
          initialStock
        ),

        minimum_stock: String(
          data.minimum_stock ?? 0
        ),

        image: data.image ?? null,

        is_active: true,
      })
      .returning("*");

    // ------------------------------------------
    // 2. Create opening stock movement
    // ------------------------------------------

    if (initialStock > 0) {
      await trx("stock_movements").insert({
        product_id: product.id,

        movement_type: "opening",

        quantity: initialStock,

        stock_after: initialStock,

        sale_id: null,

        purchase_id: null,

        created_by: null,

        reason: "Initial stock",
      });
    }

    return product as Product;
  });
}

// ==========================================
// GET PRODUCTS
// ==========================================

export async function getProducts(): Promise<Product[]> {
  const products = await db("products")
    .where({
      is_active: true,
    })
    .orderBy("id", "desc");

  return products as Product[];
}

// ==========================================
// GET PRODUCT BY ID
// ==========================================

export async function getProductById(
  id: number
): Promise<Product | undefined> {
  const product = await db("products")
    .where({
      id,
      is_active: true,
    })
    .first();

  return product as Product | undefined;
}

// ==========================================
// UPDATE PRODUCT
// ==========================================

export async function updateProduct(
  id: number,
  data: UpdateProductInput
): Promise<Product | undefined> {
  return db.transaction(async (trx) => {
    // ------------------------------------------
    // 1. Get existing product
    // ------------------------------------------

    const existingProduct =
      await trx("products")
        .where({
          id,
          is_active: true,
        })
        .first();

    if (!existingProduct) {
      return undefined;
    }

    // ------------------------------------------
    // 2. Prepare update data
    // ------------------------------------------

    const updateData: {
      current_stock?: string;
      [key: string]: any;
    } = {
      ...(data.category_id !== undefined && {
        category_id: data.category_id,
      }),

      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.sku !== undefined && {
        sku: data.sku,
      }),

      ...(data.barcode !== undefined && {
        barcode: data.barcode,
      }),

      ...(data.unit !== undefined && {
        unit: data.unit,
      }),

      ...(data.purchase_price !== undefined && {
        purchase_price: String(
          data.purchase_price
        ),
      }),

      ...(data.selling_price !== undefined && {
        selling_price: String(
          data.selling_price
        ),
      }),

      ...(data.minimum_stock !== undefined && {
        minimum_stock: String(
          data.minimum_stock
        ),
      }),

      ...(data.current_stock !== undefined && {
        current_stock: String(
          data.current_stock
        ),
      }),

      ...(data.image !== undefined && {
        image: data.image,
      }),

      updated_at: trx.fn.now(),
    };

    // ------------------------------------------
    // 3. Handle current stock separately
    // ------------------------------------------

    let stockDifference = 0;

    if (
      data.current_stock !== undefined
    ) {
      const oldStock = Number(
        existingProduct.current_stock || 0
      );

      const newStock = Number(
        data.current_stock
      );

      if (newStock < 0) {
        throw new Error(
          "Current stock cannot be negative"
        );
      }

      stockDifference =
        newStock - oldStock;

      updateData.current_stock =
        String(newStock);
    }

    // ------------------------------------------
    // 4. Update product
    // ------------------------------------------

    const [product] = await trx("products")
      .where({
        id,
        is_active: true,
      })
      .update(updateData)
      .returning("*");

    // ------------------------------------------
    // 5. Create stock movement if stock changed
    // ------------------------------------------

    if (stockDifference !== 0) {
      await trx("stock_movements").insert({
        product_id: id,

        movement_type: "adjustment",

        quantity: stockDifference,

        stock_after:
          Number(data.current_stock),

        sale_id: null,

        purchase_id: null,

        created_by: null,

        reason:
          "Stock updated from product edit",
      });
    }

    return product as Product;
  });
}

// ==========================================
// DEACTIVATE PRODUCT
// ==========================================

export async function deactivateProduct(
  id: number
): Promise<Product | undefined> {
  const [product] = await db("products")
    .where({
      id,
      is_active: true,
    })
    .update({
      is_active: false,
      updated_at: db.fn.now(),
    })
    .returning("*");

  return product as Product | undefined;
}