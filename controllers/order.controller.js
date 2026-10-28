import Ordered from "../models/Order.model.js";

const orderController = {
    // Create new order
    createOrder: async (req, res) => {
        try {
            const {
                items,
                shippingAddress,
                paymentMethod,
                customerNote
            } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    message: "Order items are required"
                });
            }

            if (
                !shippingAddress ||
                !shippingAddress.fullName ||
                !shippingAddress.phone ||
                !shippingAddress.address ||
                !shippingAddress.city
            ) {
                return res.status(400).json({
                    message: "Complete shipping address is required"
                });
            }

            // Calculate subtotal from item prices and quantities.
            // Important: In production, retrieve product prices from
            // your Product model instead of trusting client prices.
            const subtotal = items.reduce((sum, item) => {
                const price = Number(item.price);
                const quantity = Number(item.quantity);

                if (
                    !Number.isFinite(price) ||
                    price < 0 ||
                    !Number.isInteger(quantity) ||
                    quantity < 1
                ) {
                    throw new Error("Invalid item price or quantity");
                }

                return sum + price * quantity;
            }, 0);

            const order = new Ordered({
                user: req.user._id,
                items,
                shippingAddress,
                paymentMethod: paymentMethod || "cash",
                customerNote,
                subtotal
            });

            await order.save();

            return res.status(201).json({
                message: "Order created successfully",
                order
            });
        } catch (error) {
            if (error.message === "Invalid item price or quantity") {
                return res.status(400).json({
                    message: error.message
                });
            }

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: "Failed to create order"
            });
        }
    },

    // Get logged-in user's orders
    getMyOrders: async (req, res) => {
        try {
            const orders = await Ordered.find({
                user: req.user._id
            }).sort({ createdAt: -1 });

            return res.status(200).json({
                count: orders.length,
                orders
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to retrieve orders"
            });
        }
    },

    // Get one order belonging to the logged-in user
    getOrderById: async (req, res) => {
        try {
            const order = await Ordered.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            return res.status(200).json({ order });
        } catch (error) {
            if (error.name === "CastError") {
                return res.status(400).json({
                    message: "Invalid order ID"
                });
            }

            return res.status(500).json({
                message: "Failed to retrieve order"
            });
        }
    },

    // Cancel a pending order
    cancelOrder: async (req, res) => {
        try {
            const order = await Ordered.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            if (order.status !== "pending") {
                return res.status(400).json({
                    message: "Only pending orders can be cancelled"
                });
            }

            order.status = "cancelled";
            order.cancelledAt = new Date();

            await order.save();

            return res.status(200).json({
                message: "Order cancelled successfully",
                order
            });
        } catch (error) {
            if (error.name === "CastError") {
                return res.status(400).json({
                    message: "Invalid order ID"
                });
            }

            return res.status(500).json({
                message: "Failed to cancel order"
            });
        }
    }
};

export default orderController;