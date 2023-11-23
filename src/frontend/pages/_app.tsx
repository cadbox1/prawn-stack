import { Container, Header } from "cadells-vanilla-components";
import "cadells-vanilla-components/dist/index.css";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";

const App = ({ Component, pageProps }) => (
	<Container>
		<Header githubHref="https://github.com/cadbox1/prawn-stack" />
		<Component {...pageProps} />
	</Container>
);

export default App;
