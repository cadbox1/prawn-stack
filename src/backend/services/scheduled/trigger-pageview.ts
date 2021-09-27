import axios from "axios";
import { baseUrl } from "./baseUrl";

export async function handler() {
	const response = await axios.get(`${baseUrl}/home`);
	return response;
}
