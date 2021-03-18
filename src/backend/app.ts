import express from "express";
import bodyParser from "body-parser";
import { homeRouter } from "./services/home/home-router";

const app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());

app.use("/api/home", homeRouter);

// @ts-ignore
app.get("/api", async (req, res) => {
	res.json({ message: "Welcome to the Party!!" });
});

export { app };
