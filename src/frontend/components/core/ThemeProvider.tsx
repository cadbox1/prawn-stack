import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";
import { themeClass } from "./styles.css";

export const ThemeProvider = ({ ...props }) => (
	<div className={themeClass} {...props} />
);
