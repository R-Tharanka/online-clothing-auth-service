const isEmailValid = (email) => {	
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(String(email || "").toLowerCase());
};

const isPasswordStrong = (password) => {
	const value = String(password || "");
	if (value.length < 8) {
		return false;
	}

	const hasUpper = /[A-Z]/.test(value);
	const hasLower = /[a-z]/.test(value);
	const hasDigit = /\d/.test(value);

	return hasUpper && hasLower && hasDigit;
};

module.exports = {
	isEmailValid,
	isPasswordStrong,
};
