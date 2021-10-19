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
				x: format(new Date(row.datetime), "p dd-MM-yy"),
				y: row.count,
		  }))
		: [];

	return (
		<div>
			<H2>Trends</H2>
			<P>Page views per hour over time</P>
			<div style={{ height: "400px", maxWidth: "600px" }}>
				<XYChart
					height={400}
					xScale={{ type: "band", padding: -1 }}
					yScale={{ type: "linear" }}
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
						labelClassName={trendsLabel}
					/>
					<AnimatedLineSeries
						dataKey="Page views per hour"
						data={data}
						{...accessors}
					/>
					<Tooltip
						snapTooltipToDatumX
						snapTooltipToDatumY
						showHorizontalCrosshair
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
