import express from "express";
import { getClientInTransaction } from "../db/getClientInTransaction";

const router = express.Router();

router.get("/activity-hourly-rollup", async (req, res) => {
	getClientInTransaction(async (client) => {
		const { rows: activityHourlyRollupRows } = await client.query(
			`select * from activity_hourly_rollup 
			order by datetime desc
			limit 100`
		);

		res.set("Cache-Control", "no-store, max-age=0");
		res.json({ data: activityHourlyRollupRows });
	});
});

router.post("/activity-hourly-rollup", async (req, res) => {
	getClientInTransaction(async (client) => {
		await client.query(
			`INSERT INTO activity_hourly_rollup (activity, count, datetime)

			select activity, count(0) as count, date_trunc('hour', datetime) as datetime
			from activity 
			where datetime >= (
				select date_trunc('hour', datetime) - interval '1' hour 
				from activity 
				order by id desc 
				limit 1
			) 
			group by activity, date_trunc('hour', datetime)
			
			ON CONFLICT (datetime) 
			DO 
			   UPDATE SET count = EXCLUDED.count`
		);

		res.set("Cache-Control", "no-store, max-age=0");
		res.json({ message: "done" });
	});
});

export { router as rollupRouter };
