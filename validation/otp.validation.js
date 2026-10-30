const Joi = require("joi");

// Verify OTP
const verifyOtpSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    otp: Joi.string().pattern(/^\d{6}$/).required(),
});

// Forgot Password
const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
});

// Reset Password
const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .max(30)
        .required(),
});

module.exports = {
    verifyOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};