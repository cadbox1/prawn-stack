import { MDXProvider } from "@mdx-js/react";
import "fontsource-source-sans-pro/latin.css";
import { themeClass } from "../components/styles.css";
import { H1 } from "../components/H1";
import { H2 } from "../components/H2";
import { P } from "../components/P";
import { Container } from "../components/Container";
import { IMG } from "../components/IMG";
import { A } from "../components/A";
import { LI } from "../components/LI";
import { H3 } from "../components/H3";

const mdComponents = {
	h1: (props) => <H1 {...props} />,
	h2: (props) => <H2 {...props} />,
	h3: (props) => <H3 {...props} />,
	p: (props) => <P {...props} />,
	a: (props) => <A {...props} />,
	li: (props) => <LI {...props} />,
	img: (props) => <IMG {...props} />,
};

const App = ({ Component, pageProps }) => (
	<MDXProvider components={mdComponents}>
		<div className={themeClass}>
			<Container>
				<Component {...pageProps} />
			</Container>
		</div>
	</MDXProvider>
);

export default App;
