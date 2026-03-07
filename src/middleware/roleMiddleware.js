const requireRoles = (...roles) => {
	return (req, res, next) => {
		const userRoles = req.user?.roles || [];
		const normalizedRoles = roles.flatMap((role) =>
			role === "admin" ? ["shop_owner"] : [role]
		);
		const hasRole = normalizedRoles.some((role) => userRoles.includes(role));

		if (!hasRole) {
			return res.status(403).json({ message: "Forbidden" });
		}

		return next();
	};
};

module.exports = { requireRoles };
