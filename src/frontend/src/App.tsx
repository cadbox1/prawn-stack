import React, { useEffect } from "react";
import { usePromise } from "@cadbox1/use-promise";
import axios from "axios";

function App() {
	const homeRequest = usePromise({
		promiseFunction: async () => {
			const result = await axios.get("/api/home");
			return result.data;
		},
	});

	useEffect(() => {
		homeRequest.call();
	}, []);

	return (
		<div>
			<h1>Backend, Frontend AWS CDK</h1>

			<div>
				{homeRequest.pending
					? "loading..."
					: homeRequest.rejected
					? "request failed"
					: homeRequest.fulfilled &&
					  homeRequest.value && (
							<div>
								<h2>Loaded!</h2>
								{JSON.stringify(homeRequest.value)}
							</div>
					  )}
			</div>
		</div>
	);
}

export default App;
