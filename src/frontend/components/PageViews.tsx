import useSWR from "swr";
import { fetcher } from "./fetcher";

export const PageViews = () => {
	const home = useSWR("/api/home", fetcher, {
		revalidateOnFocus: false,
	});

	return (
		<h1>
			{`Page views: ${
				home.error
					? "Error loading page views"
					: !home.data
					? "loading..."
					: home.data.pageViews
			}`}
		</h1>
	);
};
