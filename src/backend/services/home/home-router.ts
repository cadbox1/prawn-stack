import express from "express";
import { getClientInTransaction } from "../db/getClientInTransaction";

const homeRouter = express.Router();

homeRouter.get("/", async (req, res) => {
	getClientInTransaction(async (client) => {
		await client.query(`INSERT INTO page_view (datetime) VALUES (NOW())`);

		const { rows: countRows } = await client.query(
			`SELECT count(0) FROM page_view`
		);

		res.json({ message: "Welcome Home!", pageViews: countRows[0] });
	});
});

export { homeRouter };
