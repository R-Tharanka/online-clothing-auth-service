const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const tokenService = require("./tokenService");
const userRepository = require("../repositories/userRepository");
const { isEmailValid, isPasswordStrong } = require("../utils/validator");
const logger = require("../utils/logger");

const createError = (statusCode, message) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const allowedRoles = ["customer", "shop_owner", "admin"];

const sanitizeUser = (user) => ({
	id: user._id.toString(),
	email: user.email,
	name: user.name,
	roles: user.roles,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

const toTokenHash = (token) =>
	crypto.createHash("sha256").update(token).digest("hex");

const register = async ({ email, password, name }) => {
	if (!isEmailValid(email)) {
		throw createError(400, "Invalid email address");
	}
	if (!isPasswordStrong(password)) {
		throw createError(
			400,
			"Password must be at least 8 characters and include upper, lower, and digit"
		);
	}
	if (!name) {
		throw createError(400, "Name is required");
	}

	const existing = await userRepository.findByEmail(email);
	if (existing) {
		throw createError(409, "User already exists");
	}

	const passwordHash = await bcrypt.hash(password, 12);
	const user = await userRepository.createUser({
		email,
		passwordHash,
		name,
		roles: ["customer"],
	});

	return { user: sanitizeUser(user) };
};

const login = async ({ email, password }) => {
	const user = await userRepository.findByEmail(email || "");
	if (!user) {
		throw createError(401, "Invalid credentials");
	}

	const passwordOk = await bcrypt.compare(password || "", user.passwordHash);
	if (!passwordOk) {
		throw createError(401, "Invalid credentials");
	}

	const accessToken = tokenService.signAccessToken(user);
	const refreshToken = tokenService.signRefreshToken(user);
	const refreshPayload = tokenService.decodeToken(refreshToken);
	const refreshTokenEntry = {
		tokenHash: toTokenHash(refreshToken),
		expiresAt: new Date((refreshPayload.exp || 0) * 1000),
	};

	await userRepository.storeRefreshToken(user._id, refreshTokenEntry);

	return {
		user: sanitizeUser(user),
		accessToken,
		refreshToken,
	};
};

const refreshTokens = async ({ refreshToken }) => {
	if (!refreshToken) {
		throw createError(400, "Refresh token is required");
	}

	const payload = tokenService.verifyRefreshToken(refreshToken);
	const tokenHash = toTokenHash(refreshToken);
	const user = await userRepository.findByRefreshTokenHash(tokenHash);

	if (!user || user._id.toString() !== payload.userId) {
		throw createError(401, "Invalid refresh token");
	}

	const tokenRecord = (user.refreshTokens || []).find(
		(entry) => entry.tokenHash === tokenHash
	);
	if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
		await userRepository.revokeRefreshToken(user._id, tokenHash);
		throw createError(401, "Refresh token expired");
	}

	await userRepository.revokeRefreshToken(user._id, tokenHash);

	const newAccessToken = tokenService.signAccessToken(user);
	const newRefreshToken = tokenService.signRefreshToken(user);
	const newRefreshPayload = tokenService.decodeToken(newRefreshToken);
	await userRepository.storeRefreshToken(user._id, {
		tokenHash: toTokenHash(newRefreshToken),
		expiresAt: new Date((newRefreshPayload.exp || 0) * 1000),
	});

	return {
		accessToken: newAccessToken,
		refreshToken: newRefreshToken,
	};
};

const logout = async ({ refreshToken }) => {
	if (!refreshToken) {
		throw createError(400, "Refresh token is required");
	}

	try {
		tokenService.verifyRefreshToken(refreshToken);
	} catch (error) {
		throw createError(400, "Invalid refresh token");
	}

	const tokenHash = toTokenHash(refreshToken);
	const user = await userRepository.findByRefreshTokenHash(tokenHash);
	if (user) {
		await userRepository.revokeRefreshToken(user._id, tokenHash);
	}

	return { message: "Logged out" };
};

const passwordResetRequest = async ({ email }) => {
	if (!isEmailValid(email)) {
		throw createError(400, "Invalid email address");
	}

	const user = await userRepository.findByEmail(email);
	if (!user) {
		return { message: "If the account exists, a reset link was sent" };
	}

	const rawToken = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
	await userRepository.setResetToken(user._id, {
		token: toTokenHash(rawToken),
		expiresAt,
	});

	logger.info("password_reset_request", {
		email,
		resetToken: rawToken,
		message: "TODO: send email via SendGrid/SES",
	});

	return { message: "If the account exists, a reset link was sent" };
};

const passwordReset = async ({ email, token, newPassword }) => {
	if (!isEmailValid(email)) {
		throw createError(400, "Invalid email address");
	}
	if (!isPasswordStrong(newPassword)) {
		throw createError(
			400,
			"Password must be at least 8 characters and include upper, lower, and digit"
		);
	}

	const user = await userRepository.findByEmail(email);
	if (!user || !user.resetToken) {
		throw createError(400, "Invalid reset token");
	}

	if (user.resetToken.expiresAt < new Date()) {
		await userRepository.clearResetToken(user._id);
		throw createError(400, "Reset token expired");
	}

	const tokenHash = toTokenHash(token || "");
	if (tokenHash !== user.resetToken.token) {
		throw createError(400, "Invalid reset token");
	}

	const passwordHash = await bcrypt.hash(newPassword, 12);
	await userRepository.updateById(user._id, { passwordHash, resetToken: null });
	await userRepository.clearRefreshTokens(user._id);

	return { message: "Password updated" };
};

const getMe = async (userId) => {
	const user = await userRepository.findById(userId);
	if (!user) {
		throw createError(404, "User not found");
	}

	return { user: sanitizeUser(user) };
};

const getUserById = async (userId) => {
	const user = await userRepository.findById(userId);
	if (!user) {
		throw createError(404, "User not found");
	}

	return { user: sanitizeUser(user) };
};

const getPublicUserById = async (userId) => {
	const user = await userRepository.findById(userId);
	if (!user) {
		throw createError(404, "User not found");
	}

	return {
		user: {
			id: user._id.toString(),
			email: user.email,
			name: user.name,
			roles: user.roles,
		},
	};
};

const addRole = async (userId, { role }) => {
	if (!role) {
		throw createError(400, "Role is required");
	}
	if (!allowedRoles.includes(role)) {
		throw createError(400, "Invalid role");
	}

	const user = await userRepository.addRole(userId, role);
	if (!user) {
		throw createError(404, "User not found");
	}

	return { user: sanitizeUser(user) };
};

const removeRole = async (userId, { role }) => {
	if (!role) {
		throw createError(400, "Role is required");
	}
	if (!allowedRoles.includes(role)) {
		throw createError(400, "Invalid role");
	}

	const user = await userRepository.removeRole(userId, role);
	if (!user) {
		throw createError(404, "User not found");
	}

	return { user: sanitizeUser(user) };
};

module.exports = {
	register,
	login,
	refreshTokens,
	logout,
	passwordResetRequest,
	passwordReset,
	getMe,
	getUserById,
	getPublicUserById,
	addRole,
	removeRole,
};
