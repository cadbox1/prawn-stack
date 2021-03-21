import { Pool, PoolClient } from "pg";
import { mocked } from "ts-jest/utils";

import {
	getDbConnectionConfig,
	getClientInTransaction,
	FunctionInTransaction,
} from "./getClientInTransaction";

const mockGetClientInTransaction = mocked(getClientInTransaction, true);

if (!mockGetClientInTransaction.mock) {
	throw new Error("getClientInTransaction helper has not been mocked.");
}

let pool: Pool;

async function setupPool() {
	const dbConnectionConfig = await getDbConnectionConfig();
	pool = new Pool(dbConnectionConfig);
}
setupPool();

export const getClientInTransactionForTesting = async (
	test: (client: PoolClient) => Promise<any>
) => {
	const client = await pool.connect();

	mockGetClientInTransaction.mockImplementation(
		(wrappedFunction: FunctionInTransaction) => {
			return wrappedFunction(client);
		}
	);

	try {
		await client.query("BEGIN");
		await test(client);
		await client.query("ROLLBACK");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
};
