import "@fontsource/source-sans-pro";
import { themeClass } from "./styles.css";

export const ThemeProvider = ({ ...props }) => (
	<div className={themeClass} {...props} />
);
