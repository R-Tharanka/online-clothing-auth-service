const logger = require("../utils/logger");

const errorMiddleware = (err, req, res) => {
	const status = err.statusCode || 500;
	const message = err.message || "Internal server error";

	if (status >= 500) {
		logger.error("Unhandled error", {
			requestId: req.requestId,
			message: err.message,
		});
	}

	res.status(status).json({ message });
};

module.exports = { errorMiddleware };
