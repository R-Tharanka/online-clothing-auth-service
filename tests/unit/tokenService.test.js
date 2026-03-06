const tokenService = require("../../src/services/tokenService");

describe("tokenService", () => {
	beforeAll(() => {
		process.env.JWT_SECRET = "test-secret";
	});

	afterAll(() => {
		delete process.env.JWT_SECRET;
	});

	it("signs and verifies access token", () => {
		const user = { _id: "user-123", roles: ["customer"] };
		const token = tokenService.signAccessToken(user);
		const payload = tokenService.verifyAccessToken(token);

		expect(payload.userId).toBe("user-123");
		expect(payload.roles).toEqual(["customer"]);
	});

	it("signs and verifies refresh token", () => {
		const user = { _id: "user-456", roles: ["admin"] };
		const token = tokenService.signRefreshToken(user);
		const payload = tokenService.verifyRefreshToken(token);

		expect(payload.userId).toBe("user-456");
		expect(payload.tokenType).toBe("refresh");
	});
});
