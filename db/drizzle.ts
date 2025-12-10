import postgres from "postgres";
import { drizzle as pgDrizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL as string);
export const fixedDb = pgDrizzle(client, { schema });
