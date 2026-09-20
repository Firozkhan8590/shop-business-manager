import db from "../../config/database";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../../types/products/product.type";

export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  const [product] = await db("products")
    .insert({
      category_id: data.category_id ?? null,
      name: data.name,
      sku: data.sku ?? null,
      barcode: data.barcode ?? null,
      unit: data.unit ?? "pcs",
      purchase_price: String(data.purchase_price ?? 0),
      selling_price: String(data.selling_price ?? 0),
      current_stock: String(data.current_stock ?? 0),
      minimum_stock: String(data.minimum_stock ?? 0),
      image: data.image ?? null,
      is_active: true,
    })
    .returning("*");

  return product as Product;
}

export async function getProducts(): Promise<Product[]> {
  const products = await db("products")
    .where({ is_active: true })
    .orderBy("id", "desc");

  return products as Product[];
}

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

export async function updateProduct(
  id: number,
  data: UpdateProductInput
): Promise<Product | undefined> {
  const updateData = {
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
      purchase_price: String(data.purchase_price),
    }),
    ...(data.selling_price !== undefined && {
      selling_price: String(data.selling_price),
    }),
    ...(data.current_stock !== undefined && {
      current_stock: String(data.current_stock),
    }),
    ...(data.minimum_stock !== undefined && {
      minimum_stock: String(data.minimum_stock),
    }),
    ...(data.image !== undefined && {
      image: data.image,
    }),
    updated_at: db.fn.now(),
  };

  const [product] = await db("products")
    .where({
      id,
      is_active: true,
    })
    .update(updateData)
    .returning("*");

  return product as Product | undefined;
}

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