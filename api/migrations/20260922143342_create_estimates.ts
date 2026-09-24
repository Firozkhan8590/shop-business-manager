import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("estimates", (table) => {
    table.bigIncrements("id").primary();

    table
      .string("estimate_number", 50)
      .notNullable()
      .unique();

    table
      .bigInteger("customer_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("customers")
      .onDelete("SET NULL");

    table
      .bigInteger("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table
      .bigInteger("updated_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table
      .date("estimate_date")
      .notNullable();

    table
      .date("valid_until")
      .nullable();

    table
      .decimal("subtotal", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("discount_percent", 5, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("total_amount", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .string("status", 30)
      .notNullable()
      .defaultTo("draft");

    table
      .text("notes")
      .nullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("customer_id");
    table.index("estimate_date");
    table.index("status");
    table.index("created_by");
  });

  await knex.schema.createTable("estimate_items", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("estimate_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("estimates")
      .onDelete("CASCADE");

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("RESTRICT");

    table
      .decimal("quantity", 12, 3)
      .notNullable();

    table
      .decimal("unit_price", 12, 2)
      .notNullable();

    table
      .decimal("total_amount", 12, 2)
      .notNullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("estimate_id");
    table.index("product_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(
    "estimate_items"
  );

  await knex.schema.dropTableIfExists(
    "estimates"
  );
}