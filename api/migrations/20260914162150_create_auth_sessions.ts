import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("auth_sessions", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.string("token_id", 100).notNullable().unique();

    table.timestamp("expires_at").notNullable();

    table.timestamp("revoked_at").nullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    table.index(["user_id"]);
    table.index(["token_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("auth_sessions");
}