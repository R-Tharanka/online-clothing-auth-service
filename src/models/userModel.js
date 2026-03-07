const mongoose = require("mongoose");

const ResetTokenSchema = new mongoose.Schema(
	{
		token: { type: String },
		expiresAt: { type: Date },
	},
	{ _id: false }
);

const RefreshTokenSchema = new mongoose.Schema(
	{
		tokenHash: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		createdAt: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true },
		passwordHash: { type: String, required: true },
		roles: {
			type: [String],
			enum: ["customer", "shop_owner"],
			default: ["customer"],
		},
		name: { type: String, required: true },
		resetToken: { type: ResetTokenSchema, default: null },
		mfaEnabled: { type: Boolean, default: false },
		refreshTokens: { type: [RefreshTokenSchema], default: [] },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
