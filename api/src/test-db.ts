import db from "./config/database";

async function testDatabase() {
  try {
    await db.raw("SELECT 1");
    console.log("✅ PostgreSQL connected successfully through Knex");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await db.destroy();
  }
}

testDatabase();