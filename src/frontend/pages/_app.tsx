import { MdxProvider } from "../components/core/MdxProvider";
import { ThemeProvider } from "../components/core/ThemeProvider";
import { Container } from "../components/core/Container";

const App = ({ Component, pageProps }) => (
	<MdxProvider>
		<ThemeProvider>
			<Container>
				<Component {...pageProps} />
			</Container>
		</ThemeProvider>
	</MdxProvider>
);

export default App;
