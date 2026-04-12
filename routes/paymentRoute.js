var express = require("express");
const { isAuthenticated } = require("../middleware/requireAuth");
const { getRazorpayClient } = require("../utils/razorpay");
const crypto = require("crypto");
var router = express.Router();

router.post('/create-payment', isAuthenticated, async (req, res) => {
    try {
        const { amount } = req.body;
        const razorpay = getRazorpayClient();
        const payment = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: "rcpt_" + Date.now(),
        });

        res.status(201).json({
            message: "Successful",
            payment: payment
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

router.post('/verify-payment', isAuthenticated, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expected = crypto
            .createHmac("sha256", process.env.RAZORPAY_TEST_SECRET)
            .update(sign)
            .digest("hex");

        if (expected === razorpay_signature) {
            res.json({ success: true })
        } else {
            res.status(400).json({ success: false })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
