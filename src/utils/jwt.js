const tokenService = require("../services/tokenService");

const getBearerToken = (authHeader) => {
	if (!authHeader) {
		return null;
	}

	return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
};

module.exports = {
	getBearerToken,
	signAccessToken: tokenService.signAccessToken,
	signRefreshToken: tokenService.signRefreshToken,
	verifyAccessToken: tokenService.verifyAccessToken,
	verifyRefreshToken: tokenService.verifyRefreshToken,
	decodeToken: tokenService.decodeToken,
};
