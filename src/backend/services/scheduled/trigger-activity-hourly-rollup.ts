import axios from "axios";
import { baseUrl } from "./baseUrl";

export async function handler() {
	const response = await axios.post(`${baseUrl}/rollup/activity-hourly-rollup`);
	return response;
}
