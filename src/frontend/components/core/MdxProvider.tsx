import { MDXProvider } from "@mdx-js/react";

import { H1 } from "./H1";
import { H2 } from "./H2";
import { P } from "./P";
import { IMG } from "./IMG";
import { A } from "./A";
import { LI } from "./LI";
import { H3 } from "./H3";
import { UL } from "./UL";
import { OL } from "./OL";
import { PRE } from "./PRE";
import { CODE } from "./CODE";

const mdComponents = {
	h1: (props) => <H1 {...props} />,
	h2: (props) => <H2 {...props} />,
	h3: (props) => <H3 {...props} />,
	p: (props) => <P {...props} />,
	a: (props) => <A {...props} />,
	ul: (props) => <UL {...props} />,
	ol: (props) => <OL {...props} />,
	li: (props) => <LI {...props} />,
	pre: (props) => <PRE {...props} />,
	inlineCode: (props) => <CODE {...props} />,
	img: (props) => <IMG {...props} />,
};

export const MdxProvider = ({ children, ...props }) => (
	<MDXProvider components={mdComponents} {...props}>
		{children}
	</MDXProvider>
);
