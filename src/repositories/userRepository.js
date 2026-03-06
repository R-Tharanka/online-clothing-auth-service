const User = require("../models/userModel");

const createUser = async (data) => {
	const user = new User(data);
	return user.save();
};

const findByEmail = async (email) => {
	return User.findOne({ email: email.toLowerCase() });
};

const findById = async (id) => {
	return User.findById(id);
};

const updateById = async (id, update) => {
	return User.findByIdAndUpdate(id, update, { returnDocument: "after" });
};

const addRole = async (userId, role) => {
	return User.findByIdAndUpdate(
		userId,
		{ $addToSet: { roles: role } },
		{ returnDocument: "after" }
	);
};

const removeRole = async (userId, role) => {
	return User.findByIdAndUpdate(
		userId,
		{ $pull: { roles: role } },
		{ returnDocument: "after" }
	);
};

const setResetToken = async (userId, resetToken) => {
	return User.findByIdAndUpdate(userId, { resetToken }, { returnDocument: "after" });
};

const clearResetToken = async (userId) => {
	return User.findByIdAndUpdate(userId, { resetToken: null }, { returnDocument: "after" });
};

const storeRefreshToken = async (userId, refreshTokenEntry) => {
	return User.findByIdAndUpdate(
		userId,
		{ $push: { refreshTokens: refreshTokenEntry } },
		{ returnDocument: "after" }
	);
};

const revokeRefreshToken = async (userId, tokenHash) => {
	return User.findByIdAndUpdate(
		userId,
		{ $pull: { refreshTokens: { tokenHash } } },
		{ returnDocument: "after" }
	);
};

const clearRefreshTokens = async (userId) => {
	return User.findByIdAndUpdate(
		userId,
		{ refreshTokens: [] },
		{ returnDocument: "after" }
	);
};

const findByRefreshTokenHash = async (tokenHash) => {
	return User.findOne({ "refreshTokens.tokenHash": tokenHash });
};

module.exports = {
	createUser,
	findByEmail,
	findById,
	updateById,
	addRole,
	removeRole,
	setResetToken,
	clearResetToken,
	storeRefreshToken,
	revokeRefreshToken,
	clearRefreshTokens,
	findByRefreshTokenHash,
};
