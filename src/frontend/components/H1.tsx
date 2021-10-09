import slugify from "slugify";
import {
	headingAnchorClass,
	headingAnchorSpanClass,
	h1Class,
} from "./styles.css";

export const H1 = ({ children, ...props }) => {
	const id = slugify(children, { lower: true });
	return (
		<h1 className={h1Class} id={id} {...props}>
			<a href={`#${id}`} className={headingAnchorClass}>
				<span className={headingAnchorSpanClass}>🔗</span>
			</a>
			{children}
		</h1>
	);
};
