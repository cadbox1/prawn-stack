import useSWR from "swr";
import { fetcher } from "./fetcher";
import { H2 } from "./core/H2";
import { P } from "./core/P";
import {
	AnimatedAxis,
	AnimatedLineSeries,
	XYChart,
	Tooltip,
} from "@visx/xychart";
import { format } from "date-fns";
import { trendsLabel } from "./core/styles.css";

const accessors = {
	xAccessor: (d) => d.x,
	yAccessor: (d) => d.y,
};

export const Trends = () => {
	const hourlyActivityRollup = useSWR(
		"/api/rollup/activity-hourly-rollup",
		fetcher,
		{
			revalidateOnFocus: false,
		}
	);

	const data = hourlyActivityRollup.data
		? hourlyActivityRollup.data.data.map((row) => ({
				x: format(new Date(row.datetime), "p dd-MM-yyyy"),
				y: row.count,
		  }))
		: [];

	return (
		<div>
			<H2>Trends</H2>
			<P>Page views per hour over time</P>
			<div style={{ height: "500px" }}>
				<XYChart
					xScale={{ type: "band", padding: -1 }}
					yScale={{ type: "linear" }}
					margin={{ top: 20, left: 50, right: 90, bottom: 140 }}
				>
					<AnimatedAxis
						orientation="left"
						label="page views per hour"
						labelClassName={trendsLabel}
					/>
					<AnimatedAxis
						orientation="bottom"
						label="time (local timezone)"
						strokeWidth={1}
						labelOffset={100}
						labelClassName={trendsLabel}
						tickLabelProps={() => ({
							transform: "translate(40 40) rotate(45) ",
						})}
					/>
					<AnimatedLineSeries
						dataKey="Page views per hour"
						data={data}
						{...accessors}
					/>
					<Tooltip
						snapTooltipToDatumX
						snapTooltipToDatumY
						showVerticalCrosshair
						showSeriesGlyphs
						renderTooltip={({ tooltipData, colorScale }) => (
							<div>
								<div
									style={{ color: colorScale(tooltipData.nearestDatum.key) }}
								>
									{tooltipData.nearestDatum.key}
								</div>
								<div>{accessors.yAccessor(tooltipData.nearestDatum.datum)}</div>
								<div>{accessors.xAccessor(tooltipData.nearestDatum.datum)}</div>
							</div>
						)}
					/>
				</XYChart>
			</div>
		</div>
	);
};
