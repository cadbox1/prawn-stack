import slugify from "slugify";
import {
	h3Class,
	headingAnchorClass,
	headingAnchorSpanClass,
} from "./styles.css";

export const H3 = ({ children, ...props }) => {
	const id = slugify(children, { lower: true });

	return (
		<h2 className={h3Class} id={id} {...props}>
			<a href={`#${id}`} className={headingAnchorClass}>
				<span className={headingAnchorSpanClass}>🔗</span>
			</a>
			{children}
		</h2>
	);
};
