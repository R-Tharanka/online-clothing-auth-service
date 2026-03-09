const authService = require("../services/authService");

const register = async (req, res, next) => {
	try {
		const result = await authService.register(req.body);
		res.status(201).json(result);
	} catch (error) {
		next(error);
	}
};

const login = async (req, res, next) => {
	try {
		const result = await authService.login(req.body);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const refreshToken = async (req, res, next) => {
	try {
		const result = await authService.refreshTokens(req.body);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const logout = async (req, res, next) => {
	try {
		const result = await authService.logout(req.body);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const passwordResetRequest = async (req, res, next) => {
	try {
		const result = await authService.passwordResetRequest(req.body);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const passwordReset = async (req, res, next) => {
	try {
		const result = await authService.passwordReset(req.body);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const getMe = async (req, res, next) => {
	try {
		const result = await authService.getMe(req.user.id);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const listUsers = async (req, res, next) => {
	try {
		const result = await authService.listUsers(req.query);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const getUserById = async (req, res, next) => {
	try {
		const result = await authService.getUserById(req.params.id);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const addRole = async (req, res, next) => {
	try {
		const result = await authService.addRole(req.params.id, req.body);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

const removeRole = async (req, res, next) => {
	try {
		const result = await authService.removeRole(req.params.id, req.body);
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	register,
	login,
	refreshToken,
	logout,
	passwordResetRequest,
	passwordReset,
	getMe,
	listUsers,
	getUserById,
	addRole,
	removeRole,
};
