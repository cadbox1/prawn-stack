import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as secrets from "@aws-cdk/aws-secretsmanager";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaNodeJs from "@aws-cdk/aws-lambda-nodejs";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
import * as integrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as budgets from "@aws-cdk/aws-budgets";
import * as certificatemanager from "@aws-cdk/aws-certificatemanager";

interface CertificateProps {
	customDomain: string;
}

export class CertificateStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props: CertificateProps) {
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
		new cdk.CfnOutput(this, "CertificateArn", {
			value: certificateArn,
		});
		new cdk.CfnOutput(this, "Instructions", {
			value: "Add the CertificateArn to `bin/prawn-cdk.ts`",
		});
	}
}

interface PrawnStackProps extends cdk.StackProps {
	region: string;
	customDomain: string;
	yourPublicIpAddress: string;
	emailAddressForBudget: string;
	certificateArn: string;
}

export class PrawnStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props: PrawnStackProps) {
		super(scope, id, props);

		const {
			customDomain,
			yourPublicIpAddress,
			emailAddressForBudget,
			certificateArn,
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

		const databaseCredentialsSecret = new secrets.Secret(
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
				version: rds.PostgresEngineVersion.VER_12_5,
			}),
			allocatedStorage: 20, // 20 GB is part of the RDS Free Tier.
			backupRetention: cdk.Duration.days(1), // This is also part of the RDS Free Tier.
			instanceType: ec2.InstanceType.of(
				ec2.InstanceClass.BURSTABLE2,
				ec2.InstanceSize.MICRO
			), // Free Tier for 12 Months then ~$20 usd/month
			credentials: rds.Credentials.fromSecret(databaseCredentialsSecret),
			vpc,
			vpcSubnets: {
				subnetType: ec2.SubnetType.PUBLIC, // this isn't ideal but it makes connecting to the database easier
			},
			securityGroups: [rdsSecurityGroup],
			removalPolicy: cdk.RemovalPolicy.DESTROY, // change this for production
			deletionProtection: false, // change this for production
		});

		// Create Lambda and API Gateway
		const lambdaApp = new lambdaNodeJs.NodejsFunction(
			this,
			"prawn-stack-lambda",
			{
				runtime: lambda.Runtime.NODEJS_14_X,
				entry: "src/backend/lambda.ts",
				handler: "handler",
				timeout: cdk.Duration.seconds(10),
				vpc: vpc,
				securityGroups: [lambdaSecurityGroup],
				tracing: lambda.Tracing.ACTIVE,
				bundling: {
					externalModules: [
						"aws-sdk", // Use the 'aws-sdk' available in the Lambda runtime
						"pg-native", // errors without this
					],
				},
				environment: {
					RDS_DATABASE_ENDPOINT: rdsInstance.instanceEndpoint.hostname,
					RDS_SECRET_NAME: id + "-rds-credentials",
				},
			}
		);
		databaseCredentialsSecret.grantRead(lambdaApp);

		const defaultIntegration = new integrations.LambdaProxyIntegration({
			handler: lambdaApp,
		});

		const httpApi = new apigw.HttpApi(this, "prawn-stack-http-api", {
			defaultIntegration,
		});

		new cdk.CfnOutput(this, "API Gateway URL", {
			value: httpApi.apiEndpoint || "",
		});

		// ---- Frontend ----

		// bucket
		const bucketName = "frontend-prawn-stack";
		const siteBucket = new s3.Bucket(this, "SiteBucket", {
			bucketName,
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "error.html",
			publicReadAccess: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY, // change this for production
			autoDeleteObjects: true, // change this for production
		});

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
						originPath: "",
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
		new cdk.CfnOutput(this, "CloudfrontDistributionURL", {
			value: "https://" + distribution.distributionDomainName,
		});
		new cdk.CfnOutput(this, "CloudfrontDistributionDomain", {
			value: distribution.distributionDomainName,
		});

		// Deploy site contents to S3 bucket
		new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
			sources: [s3deploy.Source.asset("src/frontend/out")],
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
