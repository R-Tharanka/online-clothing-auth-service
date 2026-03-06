const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../../src/app");
const { connectDatabase, disconnectDatabase } = require("../../src/config/database");

let mongoServer;

describe("Auth API", () => {
	beforeAll(async () => {
		process.env.JWT_SECRET = "test-secret";
		mongoServer = await MongoMemoryServer.create();
		process.env.MONGODB_URI = mongoServer.getUri();
		await connectDatabase();
	});

	afterAll(async () => {
		await disconnectDatabase();
		if (mongoServer) {
			await mongoServer.stop();
		}
		delete process.env.JWT_SECRET;
		delete process.env.MONGODB_URI;
	});

	it("registers and logs in a user", async () => {
		const registerResponse = await request(app)
			.post("/api/auth/register")
			.send({
				email: "user@example.com",
				password: "StrongPass1",
				name: "Test User",
			});

		expect(registerResponse.statusCode).toBe(201);
		expect(registerResponse.body.user.email).toBe("user@example.com");

		const loginResponse = await request(app)
			.post("/api/auth/login")
			.send({
				email: "user@example.com",
				password: "StrongPass1",
			});

		expect(loginResponse.statusCode).toBe(200);
		expect(loginResponse.body.accessToken).toBeTruthy();
		expect(loginResponse.body.refreshToken).toBeTruthy();
	});
});
