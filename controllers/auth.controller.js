import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password, phone, avatar } = req.body;

            const checkEmail = await User.findOne({ email });
            if (checkEmail) {
                return res.status(409).send({
                    message: "Email already belongs to another user"
                });
            }
            const user = new User({
                username,
                email,
                password,
                phone,
                avatar
            });
            await user.save();
            return res.status(201).send({
                message: "Account created successfully"
            });
        } catch (error) {
            return res.status(500).send({
                message: "Failed to create account"
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).send({
                    message: "Invalid email or password"
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).send({
                    message: "Invalid email or password"
                });
            }

            const secretKey = process.env.SECRET_KEY;

            if (!secretKey) {
                throw new Error("SECRET_KEY is not configured");
            }
            const token = jwt.sign(
                { id: user._id },
                secretKey,
                { expiresIn: "2d" }
            );
            res.cookie("access_token", `Bearer ${token}`, {
                maxAge: 1000 * 60 * 60 * 24 * 2,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax"
            });
            user.tokens.push(token);
            await user.save();
            return res.status(200).send({
                message: "Login successful"
            });
        } catch (error) {
            console.error("Login Error:", error)
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie("access_token");
            return res.status(200).send({
                message: "Logout successful"
            });
        } catch (error) {
            return res.status(500).send({
                message: "Logout failed"
            });
        }
    }
};
export default authController;