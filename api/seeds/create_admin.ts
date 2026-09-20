import type { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  const username = "admin";
  const password = "Admin@123";

  // Check whether the admin already exists
  const existingAdmin = await knex("users")
    .where({ username })
    .first();

  // Do nothing if admin already exists
  if (existingAdmin) {
    return;
  }

  // Hash the password before storing it
  const passwordHash = await bcrypt.hash(password, 12);

  await knex("users").insert({
    name: "Administrator",
    username,
    password_hash: passwordHash,
    is_active: true,
  });
}