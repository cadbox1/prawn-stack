import { pClass } from "./styles.css";

export const P = ({ children, ...props }) => (
	<p className={pClass}>{children}</p>
);
