import {
	expect as expectCDK,
	matchTemplate,
	MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as PrawnStack from "../lib/prawn-stack";

test("Empty Stack", () => {
	const app = new cdk.App();
	// WHEN
	const stack = new PrawnStack.PrawnStack(app, "MyTestStack");
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
