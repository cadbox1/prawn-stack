import { Pool } from "pg";

export const pool = new Pool({
	host: "localhost",
	database: "app",
	user: "postgres",
	password: "changeme",
	port: 5432,
	max: 1,
	connectionTimeoutMillis: 5000,
	idleTimeoutMillis: 10000,
});
