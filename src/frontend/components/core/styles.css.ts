import { createTheme, globalStyle, style } from "@vanilla-extract/css";

export const [lightThemeClass, vars] = createTheme({
	color: {
		background: "white",
		text: "black",
		primary: "hsl(220deg 100% 54%)",
		muted: "hsl(0deg 0% 80%)",
		grey: "hsl(210deg 29% 97%)",
	},
	font: {
		heading: "Source Sans Pro",
		body: "Source Sans Pro",
	},
});

export const darkThemeClass = createTheme(vars, {
	color: {
		background: "black",
		text: "white",
		primary: "hsl(190deg 100% 50%)",
		muted: "hsl(0deg 0% 30%)",
		grey: "hsl(210deg 29% 10%)",
	},
	font: {
		heading: "Source Sans Pro",
		body: "Source Sans Pro",
	},
});

globalStyle(`body`, {
	margin: 0,
	boxSizing: "border-box",
	background: vars.color.background,
});

export const containerClass = style({
	maxWidth: "800px",
	margin: "0 auto",
	padding: "0 18px",
	background: vars.color.background,
});

export const headingClass = style({
	marginTop: "32px",
	marginBottom: "12px",
	fontFamily: vars.font.heading,
	fontWeight: "bold",
	color: vars.color.text,
});

export const h1Class = style([
	headingClass,
	{
		fontSize: "34px",
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

export const fontBase = style({
	fontFamily: vars.font.body,
	color: vars.color.text,
});

export const baseClass = style([
	fontBase,
	{
		fontSize: "18px",
		lineHeight: "1.6",
	},
]);

export const pClass = style([
	baseClass,
	{
		marginTop: "0",
		marginBottom: "12px",
	},
]);

export const aClass = style([
	baseClass,
	{
		textDecoration: "none",
		color: vars.color.primary,
	},
]);

export const ulClass = style({
	margin: "0 0 12px 0",
	paddingLeft: "32px",
	selectors: {
		[`ul &, ol &`]: {
			margin: 0,
		},
	},
});

export const olClass = style({
	margin: "0 0 12px 0",
	paddingLeft: "32px",
	selectors: {
		[`ul &, ol &`]: {
			margin: 0,
		},
	},
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
	color: vars.color.text,
	backgroundColor: vars.color.grey,
	overflow: "auto",
});

export const codeClass = style({
	fontSize: "14px",
	padding: "4px 6px",
	color: vars.color.text,
	backgroundColor: vars.color.grey,
});

export const imgClass = style({
	maxWidth: "100%",
});

export const themeToggleClass = style({
	float: "right",
	fontSize: "24px",
	padding: "2px 8px",
	borderWidth: "3px",
	borderStyle: "solid",
	borderColor: vars.color.muted,
	background: "transparent",
	borderRadius: "10px",
	userSelect: "none",
});

export const headingAnchorClass = style({
	float: "left",
	marginLeft: "-13px",
	textDecoration: "none",
});

export const headingAnchorSpanClass = style({
	fontSize: "12px",
	verticalAlign: "middle",
	visibility: "hidden",
	selectors: {
		[`${headingClass}:hover ${headingAnchorClass} &, ${headingClass}:focus ${headingAnchorClass} &`]: {
			visibility: "visible",
		},
	},
});

export const trendsLabel = style([
	fontBase,
	{
		fontSize: "12px",
		fontWeight: 500,
		fill: vars.color.text,
	},
]);
