import { MDXProvider } from "@mdx-js/react";
import { H1 } from "../components/H1";
import { H2 } from "../components/H2";
import { P } from "../components/P";
import { Container } from "../components/Container";
import { themeClass } from "../components/styles.css";
import "fontsource-source-sans-pro/latin.css";

const mdComponents = {
	h1: (props) => <H1 {...props} />,
	h2: (props) => <H2 {...props} />,
	p: (props) => <P {...props} />,
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
