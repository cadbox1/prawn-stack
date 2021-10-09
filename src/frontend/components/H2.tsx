import slugify from "slugify";
import {
	h2Class,
	headingAnchorClass,
	headingAnchorSpanClass,
} from "./styles.css";

export const H2 = ({ children, ...props }) => {
	const id = slugify(children, { lower: true });

	return (
		<h2 className={h2Class} {...props}>
			<a href={`#${id}`} className={headingAnchorClass}>
				<span className={headingAnchorSpanClass}>🔗</span>
			</a>
			{children}
		</h2>
	);
};
