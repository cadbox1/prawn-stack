import pgRaw, { Client, ClientConfig, PoolClient } from "pg";
import AWSXRay from "aws-xray-sdk";
import { SecretsManager } from "@aws-sdk/client-secrets-manager";

const developmentEnvironment = process.env.NODE_ENV === "development";

let pg = pgRaw;
let AWS, secretManager: SecretsManager;

if (!developmentEnvironment) {
	secretManager = new SecretsManager();
	AWS = AWSXRay.captureAWSv3Client(secretManager);

	// @ts-ignore
	pg = AWSXRay.capturePostgres(pgRaw);
}

const developmentDbConnectionConfig: ClientConfig = {
	host: "postgres",
	user: "postgres",
	password: "changeme",
	database: "postgres",
	port: 5432,
};

let secretCredentials: string;

export async function getDbConnectionConfig({
	refetchSecret = false,
} = {}): Promise<ClientConfig> {
	if (developmentEnvironment) {
		return developmentDbConnectionConfig;
	}

	const rdsSecretName = process.env.RDS_SECRET_NAME;

	if (!rdsSecretName) {
		throw new Error("Missing RDS_SECRET_NAME envirnonment variable");
	}

	if (!secretCredentials || refetchSecret) {
		const secretRdsData = await secretManager.getSecretValue({
			SecretId: rdsSecretName,
		});

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
		ssl: { rejectUnauthorized: false },
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
