import { globalStyle, style } from "@vanilla-extract/css";
import { fontBase, vars } from "cadells-vanilla-components";

export const trendsLineClass = style({
	stroke: vars.color.secondary,
});

export const trendsAxisLineClass = style({
	stroke: vars.color.muted,
	strokeWidth: 1,
	shapeRendering: "auto",
});

export const trendsAxisTickClass = style({});

// would be nice if visx let us put a class on this directly
// would be nice if vanilla-extract let you extend classes in global styles
globalStyle(`${trendsAxisTickClass} text`, {
	fontFamily: vars.font.body,
	fill: vars.color.muted,
});

// same comment as above
globalStyle(`${trendsAxisTickClass} line`, {
	stroke: vars.color.muted,
});

export const trendsAxisLabelClass = style([
	fontBase,
	{
		fontSize: "12px",
		fontWeight: 500,
		fill: vars.color.text,
	},
]);
