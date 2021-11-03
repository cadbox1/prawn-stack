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
import {
	trendsAxisLineClass,
	trendsAxisLabelClass,
	trendsLineClass,
	trendsAxisTickClass,
} from "./core/styles.css";

const datetimeFormat = "p dd-MM-yyyy";

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
		? hourlyActivityRollup.data.data
				.map(({ datetime, count }) => ({
					x: new Date(datetime),
					y: count,
				}))
				.sort((a, b) => a.x - b.x)
				.map(({ x, y }) => ({
					x: format(x, datetimeFormat),
					y,
				}))
		: [{ x: format(new Date(), datetimeFormat), y: 0 }];

	return (
		<div>
			<H2>Trends</H2>
			<P>Page views per hour over time</P>
			<div style={{ height: "500px" }}>
				<XYChart
					xScale={{ type: "point" }} // maybe should be time but that breaks the tooltip
					yScale={{ type: "linear" }}
					margin={{ top: 20, left: 50, right: 90, bottom: 140 }}
				>
					<AnimatedAxis
						orientation="left"
						label="page views per hour"
						axisLineClassName={trendsAxisLineClass}
						tickClassName={trendsAxisTickClass}
						labelClassName={trendsAxisLabelClass}
					/>
					<AnimatedAxis
						orientation="bottom"
						label="time (local timezone)"
						labelOffset={100}
						axisLineClassName={trendsAxisLineClass}
						tickClassName={trendsAxisTickClass}
						labelClassName={trendsAxisLabelClass}
						tickLabelProps={() => ({
							transform: "translate(31 35) rotate(45) ",
						})}
					/>
					<AnimatedLineSeries
						dataKey="Page views per hour"
						data={data}
						className={trendsLineClass}
						color="red"
						{...accessors}
					/>
					<Tooltip
						snapTooltipToDatumX
						snapTooltipToDatumY
						showVerticalCrosshair
						renderTooltip={({ tooltipData }) => (
							<div>
								<div>{tooltipData.nearestDatum.key}</div>
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
