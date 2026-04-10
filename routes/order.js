var express = require('express');
const { isAuthenticated } = require('../middleware/requireAuth');
const { default: Order } = require('../Model/Order');
var router = express.Router();

router.post("/", isAuthenticated, async (req, res) => {
    try {
        const { items, shippingAddress, payment } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        // 🔥 calculate total price (secure way)
        const totalPrice = items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );

        const order = new Order({
            userId: req.user._id,
            items,
            totalPrice,
            shippingAddress,
            payment,
        });

        const savedOrder = await order.save();

        // 🔔 Socket notification
        req.io.to(req.user._id.toString()).emit("receiveNotification", {
            title: "Order Placed",
            message: "Your order has been placed 🎉",
            createdAt: new Date(),
            isRead: false,
        });

        res.status(200).json({
            message: "Successful",
            order: savedOrder
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 📦 GET USER ORDERS
router.get("/my", isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Successful",
            order: orders
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 🔍 GET SINGLE ORDER
router.get("/:id", isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Successful",
            order: orders
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 🔄 UPDATE ORDER STATUS (Admin / logic based)
router.put("/:id", isAuthenticated, async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.orderStatus = status;

        // mark delivered
        if (status === "delivered") {
            order.deliveredAt = new Date();
        }

        const updatedOrder = await order.save();

        // 🔔 Notify user
        req.io.to(order.userId.toString()).emit("receiveNotification", {
            title: "Order Update",
            message: `Your order is now ${status} 🚚`,
            createdAt: new Date(),
            isRead: false,
        });

        res.status(200).json({
            message: "Successful",
            order: updatedOrder
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router