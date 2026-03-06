const mongoose = require("mongoose");

let isConnected = false;

const connectDatabase = async () => {
	if (isConnected) {
		return;
	}

	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error("MONGODB_URI is not set");
	}

	const maxRetries = Number(process.env.MONGODB_CONNECT_RETRIES || 5);
	const retryDelayMs = Number(process.env.MONGODB_CONNECT_DELAY_MS || 2000);

	mongoose.set("strictQuery", true);
	let lastError;
	for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
		try {
			await mongoose.connect(uri);
			isConnected = true;
			return;
		} catch (error) {
			lastError = error;
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
