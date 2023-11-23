#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { CertificateStack, PrawnStack } from "../lib/prawn-stack";

const config = {
	region: "ap-southeast-2",
	customDomain: "prawn.cadell.dev",
	yourPublicIpAddress: "84.71.188.98/32",
	emailAddressForBudget: "prawn@cadell.dev",
	xRayTracingEnabled: false,
	certificateArn:
		"arn:aws:acm:us-east-1:556185703280:certificate/f4da0767-bcda-4fac-b4c4-5edbf590ab2b",
};

const app = new App();

new CertificateStack(app, "CertificateStack", {
	customDomain: config.customDomain,
});

new PrawnStack(app, "PrawnStack", {
	env: { region: config.region, account: process.env.CDK_DEFAULT_ACCOUNT },
	...config,
});
