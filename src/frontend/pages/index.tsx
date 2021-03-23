import React from "react";
import useSWR from "swr";

// @ts-ignore
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Index() {
	const { data, error } = useSWR("/api/home", fetcher);

	return (
		<h1>
			{`Page views: ${
				error
					? "Error loading page views"
					: !data
					? "loading..."
					: data.pageViews
			}`}
		</h1>
	);
}
