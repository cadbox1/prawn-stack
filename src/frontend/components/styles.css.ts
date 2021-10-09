import { createTheme, globalStyle, style } from "@vanilla-extract/css";

export const [themeClass, vars] = createTheme({
	color: {
		brand: "blue",
	},
	font: {
		heading: "Source Sans Pro",
		body: "Source Sans Pro",
	},
});

globalStyle(`body`, {
	margin: 0,
	boxSizing: "border-box",
});

export const containerClass = style({
	maxWidth: "600px",
	margin: "0 auto",
	paddingLeft: "2rem",
	paddingRight: "2rem",
});

export const headingClass = style({
	fontFamily: vars.font.heading,
});

export const h1Class = style([
	headingClass,
	{
		content: "hello",
		fontSize: "38px",
	},
]);

export const h2Class = style([
	headingClass,
	{
		fontSize: "24px",
	},
]);

export const pClass = style({
	fontFamily: vars.font.body,
});

export const headingAnchorClass = style({
	float: "left",
	marginLeft: "-22px",
	textDecoration: "none",
	content: "hello",
});

export const headingAnchorSpanClass = style({
	fontSize: "16px",
	visibility: "hidden",
	selectors: {
		[`${headingClass}:hover ${headingAnchorClass} &, ${headingClass}:focus ${headingAnchorClass} &`]: {
			visibility: "visible",
		},
	},
});
