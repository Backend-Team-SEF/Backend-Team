
import express from "express";
import authController from "../controllers/auth.controller.js";
import {
    registeration,
    login
} from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", registeration, authController.register);
router.post("/login", login, authController.login);
router.post("/logout", authController.logout);

export default router;
