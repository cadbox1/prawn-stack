import React from "react";
import Head from "next/head";
import useSWR from "swr";
import { ResponsiveLine } from "@nivo/line";

// @ts-ignore
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const dateFormat = "%Y-%m-%d %H:%M";

export default function Index() {
	const home = useSWR("/api/home", fetcher, {
		revalidateOnFocus: false,
	});

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
		<>
			<Head>
				<title>PRAwN Stack</title>
			</Head>
			<div>
				<h1>
					{`Page views: ${
						home.error
							? "Error loading page views"
							: !home.data
							? "loading..."
							: home.data.pageViews
					}`}
				</h1>
				<p>
					The code for this page is available on{" "}
					<a href="https://github.com/cadbox1/prawn-stack">GitHub</a> 🙂
				</p>
				<h2>Trends</h2>
				<p>Page views per hour over time</p>
				<div style={{ height: "400px", maxWidth: "600px" }}>
					<ResponsiveLine
						data={graphData}
						useMesh
						margin={{ top: 10, right: 100, bottom: 100, left: 50 }}
						xScale={{ type: "time" }}
						yScale={{
							type: "linear",
							min: 0,
						}}
						axisBottom={{
							legend: "time",
							format: dateFormat,
							legendOffset: 85,
							tickRotation: 35,
							legendPosition: "middle",
						}}
						axisLeft={{
							legend: "page views per hour",
							legendOffset: -40,
							legendPosition: "middle",
						}}
						xFormat={`time:${dateFormat}`}
						pointSize={8}
					/>
				</div>
			</div>
		</>
	);
}
