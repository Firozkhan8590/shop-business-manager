import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Admin Users
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id").primary();

    table.string("name", 150).notNullable();
    table.string("username", 100).notNullable().unique();
    table.string("password_hash", 255).notNullable();

    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamp("last_login_at").nullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("username");
  });

  // 2. Categories
  await knex.schema.createTable("categories", (table) => {
    table.bigIncrements("id").primary();

    table.string("name", 100).notNullable().unique();
    table.text("description").nullable();

    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
  });

  // 3. Products
  await knex.schema.createTable("products", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("category_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("categories")
      .onDelete("SET NULL");

    table.string("name", 200).notNullable();

    table.string("sku", 100).nullable().unique();
    table.string("barcode", 100).nullable().unique();

    table.string("unit", 30).notNullable().defaultTo("pcs");

    table.decimal("purchase_price", 12, 2).notNullable().defaultTo(0);
    table.decimal("selling_price", 12, 2).notNullable().defaultTo(0);

    table.decimal("current_stock", 12, 3).notNullable().defaultTo(0);
    table.decimal("minimum_stock", 12, 3).notNullable().defaultTo(0);

    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("category_id");
    table.index("name");
    table.index("barcode");
  });

  // 4. Customers
  await knex.schema.createTable("customers", (table) => {
    table.bigIncrements("id").primary();

    table.string("name", 200).notNullable();
    table.string("phone", 30).nullable();
    table.text("address").nullable();

    table.decimal("opening_balance", 12, 2).notNullable().defaultTo(0);

    table.text("notes").nullable();

    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("name");
    table.index("phone");
  });

  // 5. Suppliers
  await knex.schema.createTable("suppliers", (table) => {
    table.bigIncrements("id").primary();

    table.string("name", 200).notNullable();
    table.string("phone", 30).nullable();
    table.text("address").nullable();

    table.decimal("opening_balance", 12, 2).notNullable().defaultTo(0);

    table.text("notes").nullable();

    table.boolean("is_active").notNullable().defaultTo(true);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index("name");
    table.index("phone");
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop in reverse dependency order
  await knex.schema.dropTableIfExists("products");
  await knex.schema.dropTableIfExists("suppliers");
  await knex.schema.dropTableIfExists("customers");
  await knex.schema.dropTableIfExists("categories");
  await knex.schema.dropTableIfExists("users");
}