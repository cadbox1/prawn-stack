import { MdxProvider } from "../components/core/MdxProvider";
import { Container } from "../components/core/Container";
import { ThemeToggle } from "../components/core/themes";
import { darkThemeClass, lightThemeClass } from "../components/core/styles.css";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";

export const themes = {
	default: { class: lightThemeClass, label: `🌞` },
	dark: { class: darkThemeClass, label: `🌛` },
};

const App = ({ Component, pageProps }) => (
	<MdxProvider>
		<Container>
			<ThemeToggle themes={themes} />
			<Component {...pageProps} />
		</Container>
	</MdxProvider>
);

export default App;
