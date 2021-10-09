import { ResponsiveLine } from "@nivo/line";
import useSWR from "swr";
import { fetcher } from "./fetcher";

const dateFormat = "%Y-%m-%d %H:%M";

export const Trends = () => {
	const hourlyActivityRollup = useSWR(
		"/api/rollup/activity-hourly-rollup",
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);
	const graphData = hourlyActivityRollup.data
		? [
				{
					id: "pageview",
					data: hourlyActivityRollup.data.data.map((row) => ({
						x: new Date(row.datetime),
						y: row.count,
					})),
				},
		  ]
		: [{ id: "pageview", data: [] }];

	return (
		<div>
			<h2>Trends</h2>
			<p>Page views per hour over time</p>
			<div style={{ height: "400px", maxWidth: "600px" }}>
				<ResponsiveLine
					data={graphData}
					margin={{ top: 10, right: 70, bottom: 110, left: 70 }}
					xScale={{ type: "time", precision: "hour" }}
					yScale={{
						type: "linear",
						min: 0,
					}}
					axisBottom={{
						legend: "time",
						format: dateFormat,
						legendOffset: 100,
						tickRotation: 45,
						legendPosition: "middle",
					}}
					axisLeft={{
						legend: "page views per hour",
						legendOffset: -60,
						legendPosition: "middle",
					}}
					useMesh
					xFormat={`time:${dateFormat}`}
					pointSize={8}
				/>
			</div>
		</div>
	);
};
