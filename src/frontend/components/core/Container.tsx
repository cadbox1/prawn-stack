import { containerClass } from "./styles.css";

export const Container = ({ children, ...props }) => (
	<div className={containerClass} {...props}>
		{children}
	</div>
);
