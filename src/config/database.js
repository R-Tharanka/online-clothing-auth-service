const mongoose = require("mongoose");
const logger = require("../utils/logger");

let isConnected = false;

const connectDatabase = async () => {
	if (isConnected) {
		return;
	}

	const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
	if (!uri) {
		throw new Error("MONGODB_URI is not set");
	}

	const maxRetries = Number(process.env.MONGODB_CONNECT_RETRIES || 5);
	const retryDelayMs = Number(process.env.MONGODB_CONNECT_DELAY_MS || 2000);

	mongoose.set("strictQuery", true);
	let lastError;
	for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
		try {
			logger.info("mongodb_connect_attempt", {
				attempt,
				maxRetries,
			});
			await mongoose.connect(uri);
			isConnected = true;
			logger.info("mongodb_connected", { attempt });
			return;
		} catch (error) {
			lastError = error;
			logger.warn("mongodb_connect_failed", {
				attempt,
				maxRetries,
				error: error.message,
			});
			await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
		}
	}

	throw lastError;
};

const disconnectDatabase = async () => {
	if (!isConnected) {
		return;
	}
	await mongoose.disconnect();
	isConnected = false;
};

module.exports = { connectDatabase, disconnectDatabase };
