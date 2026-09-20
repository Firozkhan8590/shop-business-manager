import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // ==========================================
  // 1. CUSTOMER PAYMENTS
  // ==========================================
  await knex.schema.createTable("customer_payments", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("customer_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("customers")
      .onDelete("RESTRICT");

    // Optional: payment can be linked to a particular sale
    table
      .bigInteger("sale_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("sales")
      .onDelete("SET NULL");

    table
      .bigInteger("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.date("payment_date").notNullable();

    table
      .decimal("amount", 12, 2)
      .notNullable();

    table
      .string("payment_method", 30)
      .notNullable()
      .defaultTo("cash");

    table.string("reference_number", 100).nullable();

    table.text("notes").nullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("customer_id");
    table.index("sale_id");
    table.index("payment_date");
    table.index("payment_method");
  });

  // ==========================================
  // 2. SUPPLIER PAYMENTS
  // ==========================================
  await knex.schema.createTable("supplier_payments", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("supplier_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("suppliers")
      .onDelete("RESTRICT");

    // Optional: payment can be linked to a particular purchase
    table
      .bigInteger("purchase_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("purchases")
      .onDelete("SET NULL");

    table
      .bigInteger("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.date("payment_date").notNullable();

    table
      .decimal("amount", 12, 2)
      .notNullable();

    table
      .string("payment_method", 30)
      .notNullable()
      .defaultTo("cash");

    table.string("reference_number", 100).nullable();

    table.text("notes").nullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("supplier_id");
    table.index("purchase_id");
    table.index("payment_date");
    table.index("payment_method");
  });

  // ==========================================
  // 3. EXPENSES
  // ==========================================
  await knex.schema.createTable("expenses", (table) => {
    table.bigIncrements("id").primary();

    table.string("category", 100).notNullable();

    table.string("description", 255).notNullable();

    table
      .decimal("amount", 12, 2)
      .notNullable();

    table.date("expense_date").notNullable();

    table
      .string("payment_method", 30)
      .notNullable()
      .defaultTo("cash");

    table
      .bigInteger("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.text("notes").nullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("category");
    table.index("expense_date");
    table.index("payment_method");
  });

  // ==========================================
  // 4. STOCK MOVEMENTS
  // ==========================================
  await knex.schema.createTable("stock_movements", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("RESTRICT");

    // purchase, sale, adjustment, return, opening
    table
      .string("movement_type", 30)
      .notNullable();

    // Positive = stock added
    // Negative = stock removed
    table
      .decimal("quantity", 12, 3)
      .notNullable();

    // Stock quantity after this movement
    table
      .decimal("stock_after", 12, 3)
      .notNullable();

    // Optional link to sale
    table
      .bigInteger("sale_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("sales")
      .onDelete("SET NULL");

    // Optional link to purchase
    table
      .bigInteger("purchase_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("purchases")
      .onDelete("SET NULL");

    table
      .bigInteger("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.text("reason").nullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("product_id");
    table.index("movement_type");
    table.index("sale_id");
    table.index("purchase_id");
    table.index("created_by");
    table.index("created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("stock_movements");
  await knex.schema.dropTableIfExists("expenses");
  await knex.schema.dropTableIfExists("supplier_payments");
  await knex.schema.dropTableIfExists("customer_payments");
}