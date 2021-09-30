import express from "express";
import { handler as triggerActivityHourlyRollup } from "./trigger-activity-hourly-rollup";
import { handler as triggerPageview } from "./trigger-pageview";
const router = express.Router();

// this is just for local development, the lambda will hit the trigger directly

router.get("/activity-hourly-rollup", async (req, res) => {
	try {
		const responseData = await triggerActivityHourlyRollup();
		console.log("responseData:", responseData);
		res.json(responseData);
	} catch (err) {
		console.log("error:", err);
		res.json(err);
	}
});

router.get("/pageview", async (req, res) => {
	try {
		const responseData = await triggerPageview();
		console.log("responseData:", responseData);
		res.json(responseData);
	} catch (err) {
		console.log("error:", err);
		res.json(err);
	}
});

export { router as scheduledRouter };
