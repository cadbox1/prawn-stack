import pgRaw, { Client, PoolClient } from "pg";
import AWSXRay from "aws-xray-sdk";
import AwsSdk from "aws-sdk";

const developmentEnvironment = process.env.NODE_ENV === "development";

let pg = pgRaw;
let AWS, secretManager: AwsSdk.SecretsManager;

if (!developmentEnvironment) {
	AWS = AWSXRay.captureAWS(AwsSdk);
	secretManager = new AWS.SecretsManager();

	// @ts-ignore
	pg = AWSXRay.capturePostgres(pgRaw);
}

const developmentDbConnectionConfig = {
	host: "postgres",
	user: "postgres",
	password: "changeme",
	database: "postgres",
	port: 5432,
};

let secretCredentials: string;

export async function getDbConnectionConfig({ refetchSecret = false } = {}) {
	if (developmentEnvironment) {
		return developmentDbConnectionConfig;
	}

	const rdsSecretName = process.env.RDS_SECRET_NAME;

	if (!rdsSecretName) {
		throw new Error("Missing RDS_SECRET_NAME envirnonment variable");
	}

	if (!secretCredentials || refetchSecret) {
		const secretRdsData = await secretManager
			.getSecretValue({ SecretId: rdsSecretName })
			.promise();

		if (!secretRdsData.SecretString) {
			throw new Error("Secret RDS data not found");
		}

		secretCredentials = secretRdsData.SecretString;
	}

	const { username, password } = JSON.parse(secretCredentials);

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
	let dbConnectionConfig = await getDbConnectionConfig();
	let client = new pg.Client(dbConnectionConfig);
	try {
		await client.connect();
	} catch (err) {
		dbConnectionConfig = await getDbConnectionConfig({ refetchSecret: true });
		client = new pg.Client(dbConnectionConfig);
		await client.connect();
	}
	try {
		await client.query("BEGIN");
		// @ts-ignore
		await wrappedFunction(client);
		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		await client.end();
	}
};
