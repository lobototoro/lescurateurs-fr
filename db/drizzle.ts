import dotenv from "dotenv";
import postgres from "postgres";
import { drizzle as pgDrizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

dotenv.config({ quiet: true, path: [".env.local", ".env"] });

const client = postgres(process.env.DATABASE_URL as string, { prepare: false });
export const fixedDb = pgDrizzle(client, { schema });
