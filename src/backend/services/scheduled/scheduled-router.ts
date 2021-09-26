import express from "express";
import { handler as triggerActivityHourlyRollup } from "./trigger-activity-hourly-rollup";
const router = express.Router();

// this is for development, the lambda will hit the trigger directly
router.get("/activity-hourly-rollup", async (req, res) => {
	try {
		const response = await triggerActivityHourlyRollup();
		console.log("response:", response.data);
		res.json(response.data);
	} catch (err) {
		console.log("error:", err);
		res.json(err);
	}
});

export { router as scheduledRouter };
