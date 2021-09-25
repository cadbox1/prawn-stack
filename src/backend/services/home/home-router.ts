import express from "express";
import { getClientInTransaction } from "../db/getClientInTransaction";

const homeRouter = express.Router();

const PAGEVIEW_ACTIVITY = "PAGEVIEW";

homeRouter.get("/", async (req, res) => {
	getClientInTransaction(async (client) => {
		const sourceIp = req.ip;

		await client.query(
			`INSERT INTO activity (activity, feature1, datetime) VALUES ('${PAGEVIEW_ACTIVITY}', '${sourceIp}', NOW())`
		);

		const { rows: countRows } = await client.query(
			`SELECT count(0) FROM activity`
		);

		res.set("Cache-Control", "no-store, max-age=0");
		res.json({ message: "Welcome Home!", pageViews: countRows[0].count });
	});
});

export { homeRouter };
