
import express from "express";
import authRouter from "./auth.route.js";
import orderRouter from "./order.route.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/orders", orderRouter);


export default router;
