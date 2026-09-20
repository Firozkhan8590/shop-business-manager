import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // ==========================================
  // 1. SALES
  // ==========================================
  await knex.schema.createTable("sales", (table) => {
    table.bigIncrements("id").primary();

    table.string("invoice_number", 50).notNullable().unique();

    // NULL = walk-in customer
    table
      .bigInteger("customer_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("customers")
      .onDelete("SET NULL");

    // Admin who created the sale
    table
      .bigInteger("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    // Admin who last updated the sale
    table
      .bigInteger("updated_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.date("sale_date").notNullable();

    // cash, upi, card, credit, etc.
    table
      .string("payment_method", 30)
      .notNullable()
      .defaultTo("cash");

    // Total of all sale items before global discount
    table
      .decimal("subtotal", 12, 2)
      .notNullable()
      .defaultTo(0);

    // GLOBAL DISCOUNT PERCENTAGE ONLY
    table
      .decimal("discount_percent", 5, 2)
      .notNullable()
      .defaultTo(0);

    // Final amount after applying discount
    table
      .decimal("total_amount", 12, 2)
      .notNullable()
      .defaultTo(0);

    // Amount actually received
    table
      .decimal("paid_amount", 12, 2)
      .notNullable()
      .defaultTo(0);

    // Remaining customer balance
    table
      .decimal("balance_amount", 12, 2)
      .notNullable()
      .defaultTo(0);

    // completed, cancelled, etc.
    table
      .string("status", 30)
      .notNullable()
      .defaultTo("completed");

    table.text("notes").nullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("customer_id");
    table.index("sale_date");
    table.index("payment_method");
    table.index("status");
  });

  // ==========================================
  // 2. SALE ITEMS
  // ==========================================
  await knex.schema.createTable("sale_items", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("sale_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("sales")
      .onDelete("CASCADE");

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("RESTRICT");

    // Supports decimal quantities if required
    table
      .decimal("quantity", 12, 3)
      .notNullable();

    // Product selling price at the time of sale
    table
      .decimal("unit_price", 12, 2)
      .notNullable();

    // quantity × unit_price
    table
      .decimal("total_amount", 12, 2)
      .notNullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("sale_id");
    table.index("product_id");
  });

  // ==========================================
  // 3. PURCHASES
  // ==========================================
  await knex.schema.createTable("purchases", (table) => {
    table.bigIncrements("id").primary();

    table
      .string("purchase_number", 50)
      .notNullable()
      .unique();

    table
      .bigInteger("supplier_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("suppliers")
      .onDelete("SET NULL");

    // Admin who created the purchase
    table
      .bigInteger("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    // Admin who last updated the purchase
    table
      .bigInteger("updated_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.date("purchase_date").notNullable();

    // cash, upi, card, credit, etc.
    table
      .string("payment_method", 30)
      .notNullable()
      .defaultTo("cash");

    // Total of all purchase items before global discount
    table
      .decimal("subtotal", 12, 2)
      .notNullable()
      .defaultTo(0);

    // GLOBAL DISCOUNT PERCENTAGE ONLY
    table
      .decimal("discount_percent", 5, 2)
      .notNullable()
      .defaultTo(0);

    // Final amount after applying discount
    table
      .decimal("total_amount", 12, 2)
      .notNullable()
      .defaultTo(0);

    // Amount paid to supplier
    table
      .decimal("paid_amount", 12, 2)
      .notNullable()
      .defaultTo(0);

    // Remaining supplier balance
    table
      .decimal("balance_amount", 12, 2)
      .notNullable()
      .defaultTo(0);

    // completed, cancelled, etc.
    table
      .string("status", 30)
      .notNullable()
      .defaultTo("completed");

    table.text("notes").nullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("supplier_id");
    table.index("purchase_date");
    table.index("payment_method");
    table.index("status");
  });

  // ==========================================
  // 4. PURCHASE ITEMS
  // ==========================================
  await knex.schema.createTable("purchase_items", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("purchase_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("purchases")
      .onDelete("CASCADE");

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("RESTRICT");

    // Supports decimal quantities if required
    table
      .decimal("quantity", 12, 3)
      .notNullable();

    // Product purchase price at the time of purchase
    table
      .decimal("unit_price", 12, 2)
      .notNullable();

    // quantity × unit_price
    table
      .decimal("total_amount", 12, 2)
      .notNullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("purchase_id");
    table.index("product_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("purchase_items");
  await knex.schema.dropTableIfExists("purchases");
  await knex.schema.dropTableIfExists("sale_items");
  await knex.schema.dropTableIfExists("sales");
}