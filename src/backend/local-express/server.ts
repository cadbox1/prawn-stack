import express from "express";
import { handler as homeHandler } from "../home";

const app = express();

const context = null;

// ---- Setup Routes Here ----
// This should match the api gateway config in cdk.

// @ts-ignore
app.get("/api/home", async (req, res) => {
	// @ts-ignore
	const response = await homeHandler(req, context);
	// @ts-ignore
	res.status(response.statusCode).json(JSON.parse(response.body));
});

// ---- End Setup Routes ----

app.set("port", process.env.PORT || 3000);

const server = app.listen(app.get("port"), () => {
	console.log(
		"  App is running at http://localhost:%d in %s mode",
		app.get("port"),
		app.get("env")
	);
	console.log("  Press CTRL-C to stop\n");
});

export default server;
