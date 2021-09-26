import express from "express";
import bodyParser from "body-parser";
import { homeRouter } from "./services/home/home-router";
import { rollupRouter } from "./services/rollup/rollup-router";
import { scheduledRouter } from "./services/scheduled/scheduled-router";

const app = express();

app.set("port", process.env.PORT || 3000);
app.set("trust proxy", true);
app.use(bodyParser.json());

app.use("/api/home", homeRouter);
app.use("/api/rollup", rollupRouter);
app.use("/api/scheduled", scheduledRouter);

// @ts-ignore
app.get("/api", async (req, res) => {
	res.json({ message: "Welcome to the Party!!" });
});

export { app };
