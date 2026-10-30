
const express = require("express");
const router = express.Router();

const { validate } = require("../middleware/validation.middleware");

const {
    registerationScema
} = require("../validation/authintichation.validation");

const {
    verifyOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require("../validation/otp.validation");

const controller = require("../controllers/otp.controller");

// Registration & Email Verification
router.post("/register/send-otp",validate(registerationScema), controller.registerWithOtp);
router.post("/register/verify-otp",validate(verifyOtpSchema),controller.verifyOtp);

// Forgot & Reset Password
router.post("/forgot-password/send-otp", validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/forgot-password/verify-otp",validate(resetPasswordSchema), controller.resetPassword);

module.exports = router;
