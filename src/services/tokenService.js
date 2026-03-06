const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const resolveJwtConfig = () => {
	const privateKey = (process.env.JWT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
	const publicKey = (process.env.JWT_PUBLIC_KEY || "").replace(/\\n/g, "\n");

	if (privateKey && publicKey) {
		return { algorithm: "RS256", privateKey, publicKey };
	}

	const secret = process.env.JWT_SECRET;
	if (secret) {
		logger.warn("JWT_PRIVATE_KEY/JWT_PUBLIC_KEY missing. Falling back to HS256.");
		return { algorithm: "HS256", secret };
	}

	throw new Error("JWT configuration missing. Set RSA keys or JWT_SECRET.");
};

const signAccessToken = (user) => {
	const { algorithm, privateKey, secret } = resolveJwtConfig();
	const expiresIn = process.env.ACCESS_TOKEN_TTL || "15m";
	const payload = {
		userId: user._id.toString(),
		roles: user.roles || [],
	};
	const signingKey = algorithm === "RS256" ? privateKey : secret;
	return jwt.sign(payload, signingKey, { algorithm, expiresIn });
};

const signRefreshToken = (user) => {
	const { algorithm, privateKey, secret } = resolveJwtConfig();
	const expiresIn = process.env.REFRESH_TOKEN_TTL || "7d";
	const payload = {
		userId: user._id.toString(),
		roles: user.roles || [],
		tokenType: "refresh",
	};
	const signingKey = algorithm === "RS256" ? privateKey : secret;
	return jwt.sign(payload, signingKey, { algorithm, expiresIn });
};

const verifyAccessToken = (token) => {
	const { algorithm, publicKey, secret } = resolveJwtConfig();
	const verificationKey = algorithm === "RS256" ? publicKey : secret;
	return jwt.verify(token, verificationKey, { algorithms: [algorithm] });
};

const verifyRefreshToken = (token) => {
	const payload = verifyAccessToken(token);
	if (payload.tokenType !== "refresh") {
		throw new Error("Invalid refresh token");
	}
	return payload;
};

const decodeToken = (token) => jwt.decode(token);

module.exports = {
	signAccessToken,
	signRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	decodeToken,
};
