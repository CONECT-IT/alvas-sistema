import type { Config } from "drizzle-kit";

export default {
  schema: "./apps/api/src/lib/**/infrastructure/persistence/schema.ts",
  out: "./apps/api/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./apps/api/data/alvas.db",
  },
} satisfies Config;
