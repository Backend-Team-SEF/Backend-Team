
const asyncHandler = require("express-async-handler");
const crypto = require("node:crypto");

const OTP = require("../models/otp.model");
const User = require("../models/user.model");

const {
    sendOtpEmail,
    sendResetPasswordEmail
} = require("../utils/sendEmail");

// ================= Helper Functions =================

const normalizeEmail = (email) => email.trim().toLowerCase();

const hashOtp = (otp) =>
    crypto.createHash("sha256").update(otp).digest("hex");

const createAndSendOtp = async (email, userData) => {
    const otp = crypto.randomInt(100000, 1000000).toString();

    await OTP.findOneAndUpdate(
        { email },
        {
            $set: {
                otpHash: hashOtp(otp),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                userData
            }
        },
        {
            upsert: true,
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true
        }
    );

    try {
        const info = await sendOtpEmail(email, otp);
        console.log("Email sent successfully");
console.log("Message ID:", info.messageId);
    } catch (error) {
        await OTP.deleteOne({ email }).catch(() => {});
        throw error;
    }
};

const validateOtp = async (email, otp) => {
    const otpDocument = await OTP.findOne({ email });

    if (!otpDocument) {
        return { valid: false, message: "OTP not found or already used" };
    }

    if (otpDocument.expiresAt.getTime() <= Date.now()) {
        await OTP.deleteOne({ _id: otpDocument._id });

        return { valid: false, message: "OTP has expired" };
    }

    const submittedHash = Buffer.from(hashOtp(otp), "hex");
    const savedHash = Buffer.from(otpDocument.otpHash, "hex");

    const isValid =
        submittedHash.length === savedHash.length &&
        crypto.timingSafeEqual(submittedHash, savedHash);

    if (!isValid) {
        return { valid: false, message: "Invalid OTP" };
    }

    return { valid: true, otpDocument };
};

const createResetToken = async (user) => {
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    return resetToken;
};

// ================= Controller =================

const controller = {

    registerWithOtp: asyncHandler(async (req, res) => {
        const email = normalizeEmail(req.body.email);

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const userData = {
            username: req.body.username,
            password: req.body.password,
            phone: req.body.phone,
            avatar: req.body.avatar
        };

         await createAndSendOtp(email, userData);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: { email }
        });
    }),

    verifyOtp: asyncHandler(async (req, res) => {
        const email = normalizeEmail(req.body.email);
        const { otp } = req.body;

        const result = await validateOtp(email, otp);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        const { otpDocument } = result;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            await OTP.deleteOne({ _id: otpDocument._id });

            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const newUser = otpDocument.userData;

        if (!newUser) {
            return res.status(400).json({
                success: false,
                message: "Registration data is missing"
            });
        }

        const user = await User.create({
            username: newUser.username,
            email,
            password: newUser.password,
            phone: newUser.phone,
            avatar: newUser.avatar,
            isVerified: true
        });

        await OTP.deleteOne({ _id: otpDocument._id });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    isVerified: user.isVerified
                }
            }
        });
    }),

    forgotPassword: asyncHandler(async (req, res) => {
        const email = normalizeEmail(req.body.email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If the email exists, a reset link will be sent."
            });
        }

        const resetToken = await createResetToken(user);

        const resetLink =
            `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        try {
            await sendResetPasswordEmail(user.email, resetLink);
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            throw error;
        }

        return res.status(200).json({
            success: true,
            message: "If the email exists, a reset link will be sent."
        });
    }),

    resetPassword: asyncHandler(async (req, res) => {
        const { token, newPassword } = req.body;

        if (
            typeof token !== "string" ||
            !token ||
            typeof newPassword !== "string" ||
            newPassword.length < 8
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid token and password are required"
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select("+resetPasswordToken +resetPasswordExpire");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    })
};

module.exports = controller;
