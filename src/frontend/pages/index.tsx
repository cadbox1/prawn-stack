import React from "react";
import Head from "next/head";
import useSWR from "swr";

// @ts-ignore
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Index() {
	const { data, error } = useSWR("/api/home", fetcher);

	return (
		<>
			<Head>
				<title>PRAwN Stack</title>
			</Head>
			<div>
				<h1>
					{`Page views: ${
						error
							? "Error loading page views"
							: !data
							? "loading..."
							: data.pageViews
					}`}
				</h1>
				<p>
					The code for this page is available on{" "}
					<a href="https://github.com/cadbox1/prawn-stack">GitHub</a> 🙂
				</p>
			</div>
		</>
	);
}
