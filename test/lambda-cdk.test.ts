import {
	expect as expectCDK,
	matchTemplate,
	MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as LambdaCdk from "../lib/lambda-cdk-stack";

test("Empty Stack", () => {
	const app = new cdk.App();
	// WHEN
	const stack = new LambdaCdk.LambdaCdkStack(app, "MyTestStack");
	// THEN
	expectCDK(stack).to(
		matchTemplate(
			{
				Resources: {},
			},
			MatchStyle.EXACT
		)
	);
});
