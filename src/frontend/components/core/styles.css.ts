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
	maxWidth: "800px",
	margin: "0 auto",
	padding: "0 24px",
});

export const headingClass = style({
	fontFamily: vars.font.heading,
	fontWeight: "bold",
	marginTop: "32px",
	marginBottom: "12px",
});

export const h1Class = style([
	headingClass,
	{
		fontSize: "36px",
	},
]);

export const h2Class = style([
	headingClass,
	{
		fontSize: "24px",
	},
]);

export const h3Class = style([
	headingClass,
	{
		fontSize: "21px",
		marginTop: "24px",
	},
]);

export const baseClass = style({
	fontSize: "18px",
	lineHeight: "1.6",
});

export const pClass = style([
	baseClass,
	{
		fontFamily: vars.font.body,
		marginTop: "0",
		marginBottom: "12px",
	},
]);

export const aClass = style([
	baseClass,
	{
		fontFamily: vars.font.body,
		textDecoration: "none",
	},
]);

export const ulClass = style({
	marginTop: 0,
	marginBottom: "12px",
	paddingLeft: "32px",
});

export const olClass = style({
	marginTop: 0,
	marginBottom: "12px",
	paddingLeft: "32px",
});

export const liClass = style([
	baseClass,
	{
		fontFamily: vars.font.body,
	},
]);

export const preClass = style({
	fontSize: "14px",
	lineHeight: 1.4,
	marginTop: "8px",
	marginBottom: "12px",
	padding: "16px",
	backgroundColor: "hsl(210deg 29% 97%)",
	overflow: "auto",
});

export const codeClass = style({
	fontSize: "14px",
	padding: "4px 6px",
	backgroundColor: "hsl(210deg 29% 97%)",
});

export const imgClass = style({
	maxWidth: "100%",
});

export const headingAnchorClass = style({
	float: "left",
	marginLeft: "-20px",
	textDecoration: "none",
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
