const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const crypto = require("crypto");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const logger = require("./utils/logger");
const { errorMiddleware } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
	const incomingId = req.header("x-request-id");
	const requestId = incomingId || crypto.randomUUID();
	req.requestId = requestId;
	res.setHeader("x-request-id", requestId);
	next();
});

app.use(
	morgan((tokens, req, res) => {
		return JSON.stringify({
			requestId: req.requestId,
			method: tokens.method(req, res),
			url: tokens.url(req, res),
			status: Number(tokens.status(req, res)),
			responseTimeMs: Number(tokens["response-time"](req, res)),
		});
	}, {
		stream: {
			write: (message) => logger.info("http_request", { message: message.trim() }),
		},
	})
);

const swaggerDocument = YAML.load("openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);

module.exports = app;
