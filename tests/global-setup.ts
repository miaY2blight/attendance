import { execSync } from "node:child_process";
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(__dirname, "../.env.test") });

const projectRoot = path.resolve(__dirname, "..");

export default async function setup() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl) {
    throw new Error(
      "TEST_DATABASE_URL is not set. Create a .env.test file with a connection string for a " +
        "dedicated test Postgres database (see README.md). Never point it at a production database " +
        "— this reset drops all data in it.",
    );
  }

  // Resets the schema (drops + recreates) so every test run starts from a clean, empty database.
  execSync("npx prisma migrate reset --force --skip-generate --skip-seed", {
    cwd: projectRoot,
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  });
}
