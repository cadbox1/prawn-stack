import useSWR from "swr";
import { fetcher } from "./fetcher";
import { H1 } from "cadells-vanilla-components";

export const PageViews = () => {
	const home = useSWR("/api/home", fetcher, {
		revalidateOnFocus: false,
	});

	return (
		<H1>
			{`Page views: ${
				home.error
					? "Error loading page views"
					: !home.data
					? "..."
					: home.data.pageViews
			}`}
		</H1>
	);
};
