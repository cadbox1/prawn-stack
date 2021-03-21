import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as secrets from "@aws-cdk/aws-secretsmanager";
import * as ssm from "@aws-cdk/aws-ssm";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaNodeJs from "@aws-cdk/aws-lambda-nodejs";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
import * as integrations from "@aws-cdk/aws-apigatewayv2-integrations";

import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";

export class PrawnStack extends cdk.Stack {
	constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// ---- Backend ----

		// Create VPC for RDS and Lambda
		const vpc = new ec2.Vpc(this, "prawn-stack-vpc", {
			maxAzs: 2, // must be at least 2 to make RDS happy
			natGateways: 0, // this saves money!
		});

		// we need this to access secret manager because we don't have a NAT gateway because it's expensive.
		vpc.addInterfaceEndpoint("SecretsManagerEndpoint", {
			service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
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

		const yourPublicIpAddress = "180.150.80.84/32"; // Allow connections to the database from your ip address. Not ideal but convenient.
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
			credentials: rds.Credentials.fromSecret(databaseCredentialsSecret),
			instanceType: ec2.InstanceType.of(
				ec2.InstanceClass.BURSTABLE2,
				ec2.InstanceSize.MICRO
			), // Free Tier for 12 Months then ~$20 usd/month
			vpc,
			vpcSubnets: {
				subnetType: ec2.SubnetType.PUBLIC, // this isn't ideal but it makes connecting to the database easier
			},
			removalPolicy: cdk.RemovalPolicy.DESTROY, // change this for production
			deletionProtection: false, // change this for production
			securityGroups: [rdsSecurityGroup],
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
		const bucketName = "frontend-aws-cdk";
		const siteBucket = new s3.Bucket(this, "SiteBucket", {
			bucketName,
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "error.html",
			publicReadAccess: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY, // change this for production
		});

		// cloudfront distribution
		const distribution = new cloudfront.CloudFrontWebDistribution(
			this,
			"SiteDistribution",
			{
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
									headers: ["Authorization"],
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

		// Deploy site contents to S3 bucket
		new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
			sources: [s3deploy.Source.asset("src/frontend/out")],
			destinationBucket: siteBucket,
			distribution,
			distributionPaths: ["/*"],
		});
	}
}
