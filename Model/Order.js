import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            required: true,
        },

        // 🔥 SNAPSHOT DATA
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
        },

        totalPrice: {
            type: Number,
            required: true,
        },

        orderStatus: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
            default: "pending",
        },

        payment: {
            method: {
                type: String,
                enum: ["COD", "RAZORPAY", "STRIPE"],
                default: "COD",
            },
            status: {
                type: String,
                enum: ["pending", "paid", "failed"],
                default: "pending",
            },
            transactionId: String,
        },

        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;