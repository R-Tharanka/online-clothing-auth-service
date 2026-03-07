// Swap this module with pino/winston in production if desired.
const formatMessage = (level, message, meta) => {
	const timestamp = new Date().toISOString();
	let line = `[${timestamp}] ${level.toUpperCase()} ${message}`;

	if (meta && Object.keys(meta).length > 0) {
		const pairs = Object.entries(meta)
			.map(([key, value]) => `${key}=${JSON.stringify(value)}`)
			.join(" ");
		line = `${line} ${pairs}`;
	}

	return line;
};

const info = (message, meta) => {
	console.log(formatMessage("info", message, meta));
};

const warn = (message, meta) => {
	console.warn(formatMessage("warn", message, meta));
};

const error = (message, meta) => {
	console.error(formatMessage("error", message, meta));
};

module.exports = {
	info,
	warn,
	error,
};
