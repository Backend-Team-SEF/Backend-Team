import express from "express";
import orderController from "../controllers/order.controller.js";
import { authintication } from "../middleware/authintication.middleware.js";

const router = express.Router();

router.post("/", authintication, orderController.createOrder);
router.get("/my-orders", authintication, orderController.getMyOrders);
router.get("/:id", authintication, orderController.getOrderById);
router.patch("/:id/cancel", authintication, orderController.cancelOrder);

export default router;