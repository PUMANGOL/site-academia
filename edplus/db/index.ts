import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
	pg: ReturnType<typeof postgres> | undefined;
};

function getClient() {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is not set");
	}

	if (!globalForDb.pg) {
		globalForDb.pg = postgres(url, {
			max: 10,
			connect_timeout: 5,
			idle_timeout: 20,
		});
	}

	return globalForDb.pg;
}

export const db = drizzle(getClient(), { schema });
export type Database = typeof db;
