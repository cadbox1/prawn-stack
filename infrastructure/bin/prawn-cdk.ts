#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CertificateStack, PrawnStack } from "../lib/prawn-stack";

const config = {
	region: "ap-southeast-2",
	customDomain: "prawn.cadell.dev",
	yourPublicIpAddress: "180.150.80.84/32",
	emailAddressForBudget: "prawn@cadell.dev",
	xRayTracingEnabled: false,
	certificateArn:
		"arn:aws:acm:us-east-1:680342813135:certificate/94c373a7-b3fe-4975-bb4a-fc48d4200411",
};

const app = new cdk.App();

new CertificateStack(app, "CertificateStack", {
	customDomain: config.customDomain,
});

new PrawnStack(app, "PrawnStack", {
	env: { region: config.region, account: process.env.CDK_DEFAULT_ACCOUNT },
	...config,
});
