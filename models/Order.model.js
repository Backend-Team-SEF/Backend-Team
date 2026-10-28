import mongoose from "mongoose";

const orderedSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                image: {
                    type: String,
                    default: ""
                }
            }
        ],

        shippingAddress: {
            fullName: {
                type: String,
                required: true,
                trim: true
            },
            phone: {
                type: String,
                required: true,
                trim: true
            },
            address: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            }
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "stripe", "paymob", "paypal"],
            default: "cash"
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },

        transactionId: {
            type: String,
            default: null
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        shippingFee: {
            type: Number,
            default: function () {
                return this.subtotal >= 1000 ? 0 : 50;
            },
            min: 0
        },

        tax: {
            type: Number,
            default: function () {
                return this.subtotal * 0.14;
            },
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0
        },

        totalPrice: {
            type: Number,
            default: 0,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        },

        paidAt: {
            type: Date
        },

        deliveredAt: {
            type: Date
        },

        cancelledAt: {
            type: Date
        },

        customerNote: {
            type: String,
            maxlength: 1000
        },

        adminNote: {
            type: String,
            maxlength: 1000
        }
    },
    {
        timestamps: true
    }
);

// Calculate total price before saving the order
orderedSchema.pre("save", function () {
    this.totalPrice =
        (this.subtotal || 0) +
        (this.shippingFee || 0) +
        (this.tax || 0) -
        (this.discount || 0);

    if (this.status === "delivered" && !this.deliveredAt) {
        this.deliveredAt = new Date();
    }

    if (this.status === "cancelled" && !this.cancelledAt) {
        this.cancelledAt = new Date();
    }

    if (this.paymentStatus === "paid" && !this.paidAt) {
        this.paidAt = new Date();
    }
});

const Ordered = mongoose.model("Ordered", orderedSchema);

export default Ordered;