const dotenv = require("dotenv");

const loadEnv = () => {
	dotenv.config();

	return {
		port: process.env.PORT || 5000,
		mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI,
	};
};

module.exports = { loadEnv };
