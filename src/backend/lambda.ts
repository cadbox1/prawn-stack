import serverlessExpress from "@vendia/serverless-express";
import { app } from "./app";

// @ts-ignore
export const handler = serverlessExpress({ app });
