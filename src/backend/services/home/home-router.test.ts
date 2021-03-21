import request from "supertest";
import { getClientInTransactionForTesting } from "../db/getClientInTransactionForTests";
import { app } from "../../app";

describe("GET /home", () => {
	// @todo make this deterministic
	it("should have a pageView", async () => {
		await getClientInTransactionForTesting((client) =>
			request(app)
				.get("/api/home")
				.expect(200)
				.then((response) => {
					expect(response.body).toHaveProperty("pageViews");
				})
		);
	});
});
