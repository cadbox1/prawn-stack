import { MdxProvider } from "../components/core/MdxProvider";
import { Container } from "../components/core/Container";
import { setupInitialTheme, ThemeToggle } from "../components/core/themes";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";

setupInitialTheme();

const App = ({ Component, pageProps }) => (
	<MdxProvider>
		<Container>
			<ThemeToggle />
			<Component {...pageProps} />
		</Container>
	</MdxProvider>
);

export default App;
