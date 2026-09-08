import { defineConfig, env } from "prisma/config";

// Load local .env into process.env using Node's native loadEnvFile
try {
  process.loadEnvFile();
} catch {
  // Ignore if .env file is missing
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
