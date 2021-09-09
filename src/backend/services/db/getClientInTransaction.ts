import { Client, PoolClient } from "pg";
import AWS from "aws-sdk";

const developmentEnvironment = process.env.NODE_ENV === "development";

const developmentDbConnectionConfig = {
	host: "postgres",
	user: "postgres",
	password: "changeme",
	database: "postgres",
	port: 5432,
};

var secretManager = new AWS.SecretsManager();

export async function getDbConnectionConfig() {
	if (developmentEnvironment) {
		return developmentDbConnectionConfig;
	}

	const rdsSecretName = process.env.RDS_SECRET_NAME;

	if (!rdsSecretName) {
		throw new Error("Missing RDS_SECRET_NAME envirnonment variable");
	}

	const secretRdsData = await secretManager
		.getSecretValue({ SecretId: rdsSecretName })
		.promise();

	if (!secretRdsData.SecretString) {
		throw new Error("Secret RDS data not found");
	}

	const { username, password } = JSON.parse(secretRdsData.SecretString);

	return {
		host: process.env.RDS_DATABASE_ENDPOINT,
		user: username,
		password,
		database: "postgres",
		port: 5432,
	};
}

export type FunctionInTransaction = (
	client: Client | PoolClient
) => Promise<any>;

export type GetClientInTransaction = (
	wrappedFunction: FunctionInTransaction
) => Promise<any>;

export const getClientInTransaction: GetClientInTransaction = async (
	wrappedFunction: FunctionInTransaction
) => {
	const dbConnectionConfig = await getDbConnectionConfig();
	const client = new Client(dbConnectionConfig);
	client.connect();
	try {
		await client.query("BEGIN");
		await wrappedFunction(client);
		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.end();
	}
};
