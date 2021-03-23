#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PrawnStack } from "../lib/prawn-stack";

const app = new cdk.App();
new PrawnStack(app, "PrawnStack", {
	env: { region: "ap-southeast-2", account: process.env.CDK_DEFAULT_ACCOUNT },
});
