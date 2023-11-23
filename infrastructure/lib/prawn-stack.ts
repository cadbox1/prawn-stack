import { Construct } from "constructs";
import {
	Stack,
	StackProps,
	CfnOutput,
	Duration,
	RemovalPolicy,
} from "aws-cdk-lib";
import * as apigatewayv2integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apigatewayv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import {
	aws_certificatemanager as certificatemanager,
	aws_ec2 as ec2,
	aws_secretsmanager as secretsmanager,
	aws_rds as rds,
	aws_lambda_nodejs as lambdanodejs,
	aws_lambda as lambda,
	aws_events as events,
	aws_events_targets as eventstargets,
	aws_s3 as s3,
	aws_cloudfront as cloudfront,
	aws_s3_deployment as s3deployment,
	aws_budgets as budgets,
} from "aws-cdk-lib";
import { Effect, PolicyStatement, StarPrincipal } from "aws-cdk-lib/aws-iam";

interface CertificateProps {
	customDomain: string;
}

export class CertificateStack extends Stack {
	constructor(scope: Construct, id: string, props: CertificateProps) {
		super(scope, id, {
			env: { region: "us-east-1" }, // must be in us-east-1 for cloudfront
		});

		const { customDomain } = props;

		const certificate = new certificatemanager.Certificate(
			this,
			"CustomDomainCertificate",
			{
				domainName: customDomain,
				validation: certificatemanager.CertificateValidation.fromEmail(),
			}
		);

		const certificateArn = certificate.certificateArn;
		new CfnOutput(this, "CertificateArn", {
			value: certificateArn,
		});
		new CfnOutput(this, "Instructions", {
			value: "Add the CertificateArn to `bin/prawn-cdk.ts`",
		});
	}
}

interface PrawnStackProps extends StackProps {
	region: string;
	customDomain: string;
	yourPublicIpAddress: string;
	emailAddressForBudget: string;
	xRayTracingEnabled: boolean;
	certificateArn: string;
}

export class PrawnStack extends Stack {
	constructor(scope: Construct, id: string, props: PrawnStackProps) {
		super(scope, id, props);

		const {
			customDomain,
			yourPublicIpAddress,
			emailAddressForBudget,
			certificateArn,
			xRayTracingEnabled,
		} = props;

		// ---- Backend ----

		// Create VPC for RDS and Lambda
		const vpc = new ec2.Vpc(this, "prawn-stack-vpc", {
			maxAzs: 2, // must be at least 2 to make RDS happy

			// this isn't recommended by AWS but it's cheaper than their managed NAT Gateway
			natGatewayProvider: ec2.NatProvider.instance({
				// free tier
				instanceType: ec2.InstanceType.of(
					ec2.InstanceClass.T2,
					ec2.InstanceSize.MICRO
				),
			}),
			natGateways: 1,
		});

		// Create database credentials
		const databaseUsername = "PrawnStackLambdaUser"; // no hyphens allowed

		const databaseCredentialsSecret = new secretsmanager.Secret(
			this,
			"DBCredentialsSecret",
			{
				secretName: id + "-rds-credentials",
				generateSecretString: {
					secretStringTemplate: JSON.stringify({
						username: databaseUsername,
					}),
					excludePunctuation: true,
					includeSpace: false,
					generateStringKey: "password",
				},
			}
		);

		// Create security groups
		const rdsSecurityGroup = new ec2.SecurityGroup(this, "RDS Security Group", {
			vpc,
		});
		const lambdaSecurityGroup = new ec2.SecurityGroup(
			this,
			"Lambda Security Group",
			{
				vpc,
			}
		);
		rdsSecurityGroup.addIngressRule(
			lambdaSecurityGroup,
			ec2.Port.tcp(5432),
			"Allow Lambda Security Group"
		);

		rdsSecurityGroup.addIngressRule(
			ec2.Peer.ipv4(yourPublicIpAddress),
			ec2.Port.tcp(5432),
			"Allow Connections from Static IP Address"
		);

		// Create postgres database
		const rdsInstance = new rds.DatabaseInstance(this, "DBInstance", {
			engine: rds.DatabaseInstanceEngine.postgres({
				version: rds.PostgresEngineVersion.VER_15_4,
			}),
			allocatedStorage: 20, // 20 GB is part of the RDS Free Tier.
			backupRetention: Duration.days(1), // This is also part of the RDS Free Tier.
			instanceType: ec2.InstanceType.of(
				ec2.InstanceClass.BURSTABLE4_GRAVITON,
				ec2.InstanceSize.MICRO
			), // Free tier for 12 months then ~$19 usd/month
			credentials: rds.Credentials.fromSecret(databaseCredentialsSecret),
			vpc,
			vpcSubnets: {
				subnetType: ec2.SubnetType.PUBLIC, // this isn't ideal but it makes connecting to the database easier
			},
			securityGroups: [rdsSecurityGroup],
			removalPolicy: RemovalPolicy.DESTROY, // change this for production
			deletionProtection: false, // change this for production
		});

		// Create Lambda and API Gateway
		const environment = {
			RDS_DATABASE_ENDPOINT: rdsInstance.instanceEndpoint.hostname,
			RDS_SECRET_NAME: id + "-rds-credentials",
			BASE_URL: `https://${customDomain}/api`,
		};

		const lambdaApp = new lambdanodejs.NodejsFunction(
			this,
			"prawn-stack-lambda",
			{
				runtime: lambda.Runtime.NODEJS_20_X,
				architecture: lambda.Architecture.ARM_64,
				entry: "src/backend/lambda.ts",
				handler: "handler",
				timeout: Duration.seconds(10),
				vpc: vpc,
				securityGroups: [lambdaSecurityGroup],
				tracing: xRayTracingEnabled
					? lambda.Tracing.ACTIVE
					: lambda.Tracing.DISABLED,
				bundling: {
					externalModules: [
						// Use the 'aws-sdk' available in the Lambda runtime
						"aws-sdk",
						"@aws-sdk/client-secrets-manager",
						"pg-native", // errors without this
					],
				},
				environment,
			}
		);
		databaseCredentialsSecret.grantRead(lambdaApp);

		const defaultIntegration = new apigatewayv2integrations.HttpLambdaIntegration(
			"lambdaHandler",
			lambdaApp
		);

		const httpApi = new apigatewayv2.HttpApi(this, "prawn-stack-http-api", {
			defaultIntegration,
		});

		new CfnOutput(this, "API Gateway URL", {
			value: httpApi.apiEndpoint || "",
		});

		// scheduled rollup
		const activityHourlyRollupTrigger = new lambdanodejs.NodejsFunction(
			this,
			"prawn-stack-activityHourlyRollupTrigger",
			{
				runtime: lambda.Runtime.NODEJS_20_X,
				architecture: lambda.Architecture.ARM_64,
				entry:
					"src/backend/services/scheduled/trigger-activity-hourly-rollup.ts",
				handler: "handler",
				timeout: Duration.seconds(10),
				bundling: {
					externalModules: [
						// Use the 'aws-sdk' available in the Lambda runtime
						"aws-sdk",
						"@aws-sdk/client-secrets-manager",
						"pg-native", // errors without this
					],
				},
				environment,
			}
		);
		const activityHourlyRollupTriggerRule = new events.Rule(
			this,
			"Prawn hourly activity rollup",
			{
				schedule: events.Schedule.cron({ minute: "0", hour: "*" }),
			}
		);
		activityHourlyRollupTriggerRule.addTarget(
			new eventstargets.LambdaFunction(activityHourlyRollupTrigger)
		);

		// scheduled pageview
		const pageviewTrigger = new lambdanodejs.NodejsFunction(
			this,
			"prawn-stack-pageviewTrigger",
			{
				runtime: lambda.Runtime.NODEJS_20_X,
				architecture: lambda.Architecture.ARM_64,
				entry: "src/backend/services/scheduled/trigger-pageview.ts",
				handler: "handler",
				timeout: Duration.seconds(10),
				bundling: {
					externalModules: [
						// Use the 'aws-sdk' available in the Lambda runtime
						"aws-sdk",
						"@aws-sdk/client-secrets-manager",
						"pg-native", // errors without this
					],
				},
				environment,
			}
		);
		const pageviewTriggerRule = new events.Rule(this, "Prawn hourly pageview", {
			schedule: events.Schedule.cron({ minute: "30", hour: "*" }),
		});
		pageviewTriggerRule.addTarget(
			new eventstargets.LambdaFunction(pageviewTrigger)
		);

		// ---- Frontend ----

		// bucket
		const bucketName = "frontend-prawn-stack";
		const siteBucket = new s3.Bucket(this, "SiteBucket", {
			bucketName,
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "error.html",
			removalPolicy: RemovalPolicy.DESTROY, // change this for production
			autoDeleteObjects: true, // change this for production
			publicReadAccess: true,
			blockPublicAccess: {
				blockPublicAcls: false,
				ignorePublicAcls: false,
				blockPublicPolicy: false,
				restrictPublicBuckets: false,
			},
		});

		siteBucket.addToResourcePolicy(
			new PolicyStatement({
				actions: ["s3:GetObject"],
				effect: Effect.ALLOW,
				principals: [new StarPrincipal()],
				resources: [siteBucket.arnForObjects("*")],
			})
		);

		const certificate = certificatemanager.Certificate.fromCertificateArn(
			this,
			"Certificate",
			certificateArn
		);

		// cloudfront distribution
		const distribution = new cloudfront.CloudFrontWebDistribution(
			this,
			"SiteDistribution",
			{
				priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
				viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
					certificate,
					{
						aliases: [customDomain],
						securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
						sslMethod: cloudfront.SSLMethod.SNI,
					}
				),
				originConfigs: [
					{
						customOriginSource: {
							domainName: siteBucket.bucketWebsiteDomainName,
							originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
						},
						behaviors: [{ isDefaultBehavior: true }],
					},
					// api origin - https://stackoverflow.com/a/57467656/728602
					{
						customOriginSource: {
							domainName: `${httpApi.httpApiId}.execute-api.${this.region}.${this.urlSuffix}`,
						},
						behaviors: [
							{
								pathPattern: "/api/*",
								allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
								forwardedValues: {
									queryString: true,
									headers: ["Authorization"], // might need this later
								},
							},
						],
					},
				],
			}
		);
		new CfnOutput(this, "CloudfrontDistributionURL", {
			value: "https://" + distribution.distributionDomainName,
		});
		new CfnOutput(this, "CloudfrontDistributionDomain", {
			value: distribution.distributionDomainName,
		});

		// Deploy site contents to S3 bucket
		new s3deployment.BucketDeployment(this, "DeployWithInvalidation", {
			sources: [s3deployment.Source.asset("src/frontend/out")],
			destinationBucket: siteBucket,
			distribution,
			distributionPaths: ["/*"],
		});

		// budget
		new budgets.CfnBudget(this, "tight-ass-budget", {
			budget: {
				budgetName: "tight-ass-budget",
				budgetType: "COST",
				timeUnit: "MONTHLY",
				budgetLimit: { amount: 1, unit: "USD" },
			},
			notificationsWithSubscribers: [
				{
					notification: {
						notificationType: "ACTUAL",
						comparisonOperator: "GREATER_THAN",
						threshold: 100, // percent
					},
					subscribers: [
						{ subscriptionType: "EMAIL", address: emailAddressForBudget },
					],
				},
			],
		});
	}
}
