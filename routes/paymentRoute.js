var express = require("express");
const { isAuthenticated } = require("../middleware/requireAuth");
const { getRazorpayClient } = require("../utils/razorpay");
const crypto = require("crypto");
const { default: Products } = require("../Model/Products");
const { default: Order } = require("../Model/Order");
var router = express.Router();

router.post("/create-payment", isAuthenticated, async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "No items provided"
            });
        }

        let total = 0;
        let finalItems = [];

        for (const item of items) {
            const product = await Products.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            total += product.price * item.quantity;

            finalItems.push({
                productId: product._id,
                name: product.productName,
                image: product.image[0],
                price: product.price,
                quantity: item.quantity
            });
        }

        const razorpay = getRazorpayClient();

        const paymentOrder = await razorpay.orders.create({
            amount: total * 100,
            currency: "INR",
            receipt: "rcpt_" + Date.now()
        });

        await Order.create({
            userId: req.user._id,
            items: finalItems,
            totalPrice: total,
            shippingAddress: req.user.shippingAddress,
            payment: {
                method: "RAZORPAY",
                status: "pending",
                razorpayOrderId: paymentOrder.id
            }
        });

        res.status(201).json({
            success: true,
            paymentOrder
        });

    } catch (error) {
        console.error("Payment Creation Error:", error);
        res.status(500).json({
            error: error.message
        });
    }
});

router.post("/verify-payment", isAuthenticated, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const generated = crypto
            .createHmac("sha256", process.env.RAZORPAY_TEST_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment"
            });
        }

        const order = await Order.findOne({
            "payment.razorpayOrderId": razorpay_order_id,
            userId: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Prevent double verify
        if (order.payment.status === "paid") {
            return res.json({
                success: true,
                message: "Already verified"
            });
        }

        // Update order
        order.payment.status = "paid";
        order.payment.transactionId = razorpay_payment_id;
        order.orderStatus = "confirmed";

        // Reduce stock
        for (const item of order.items) {
            await Products.findByIdAndUpdate(
                item.productId,
                {
                    $inc: { stock: -item.quantity }
                }
            );
        }

        await order.save();

        res.json({
            success: true,
            message: "Payment verified successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router
