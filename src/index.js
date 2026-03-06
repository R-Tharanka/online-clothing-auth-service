const app = require("./app");
const { connectDatabase } = require("./config/database");
const { loadEnv } = require("./config/env");
const logger = require("./utils/logger");

const { port } = loadEnv();

(async () => {
	await connectDatabase();
	app.listen(port, () => {
		logger.info("auth_service_started", {
			port,
			healthUrl: `http://localhost:${port}/health`,
		});
	});
})().catch((error) => {
	logger.error("Failed to start auth service", { message: error.message });
	process.exit(1);
});
