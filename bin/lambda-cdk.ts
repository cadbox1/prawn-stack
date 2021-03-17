#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { LambdaCdkStack } from "../lib/lambda-cdk-stack";

const app = new cdk.App();
new LambdaCdkStack(app, "LambdaCdkStack", {
	env: { region: "ap-southeast-2" },
});
