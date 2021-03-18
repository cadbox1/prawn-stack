import { pool } from "./pool";
import { PoolClient } from "pg";

export type FunctionInTransaction = (client: PoolClient) => Promise<any>;

export type GetClientInTransaction = (
	wrappedFunction: FunctionInTransaction
) => Promise<any>;

export const getClientInTransaction: GetClientInTransaction = async (
	wrappedFunction: FunctionInTransaction
) => {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");
		await wrappedFunction(client);
		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
};
