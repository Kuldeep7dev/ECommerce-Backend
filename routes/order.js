var express = require('express');
const { isAuthenticated } = require('../middleware/requireAuth');
const { default: Order } = require('../Model/Order');
const { default: Products } = require('../Model/Products');
var router = express.Router();

router.post("/", isAuthenticated, async (req, res) => {
    try {
        const { items, shippingAddress, payment } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "No items in order"
            });
        }

        let finalItems = [];
        let totalPrice = 0;

        for (const item of items) {
            const product = await Products.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            const snapshotItem = {
                productId: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: item.quantity
            };

            finalItems.push(snapshotItem);

            totalPrice += product.price * item.quantity;
        }

        const order = await Order.create({
            userId: req.user._id,
            items: finalItems,
            totalPrice,
            shippingAddress,
            payment
        });

        res.status(201).json({
            message: "Successful",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
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