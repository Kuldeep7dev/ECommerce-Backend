var express = require('express');
const { isAuthenticated } = require('../middleware/requireAuth');
const Wishlist = require('../Model/Wishlist');
const Products = require('../Model/Products');
const Auth = require('../Model/Auth');
const Notification = require('../Model/Notification');
const { emitToAdmins } = require('../utils/socket');
var router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id
        const wishlist = await Wishlist.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName price image brand'
        });

        res.status(200).json({
            message: "Wishlist fetched",
            wishlist: wishlist || { items: [] }
        })
    } catch (error) {
        res.status(500).json({ message: "Something error" })
    }
});

router.post('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                userId,
                items: [{ productId }],
                totalItems: 1
            });

            return res.status(201).json({
                message: "Wishlist created and product added",
                wishlist
            });
        }

        const alreadyExists = wishlist.items.find(
            item => item.productId.toString() === productId
        );

        if (alreadyExists) {
            return res.status(400).json({
                message: "Product already in wishlist"
            });
        }

        // ➕ Add new product
        wishlist.items.push({ productId });

        // 🔢 Update totalItems
        wishlist.totalItems = wishlist.items.length;

        await wishlist.save();

        // Notify Admins
        const admins = await Auth.find({ role: 'admin' });
        const notificationData = {
            type: "SYSTEM",
            title: "New Wishlist Addition ❤️",
            message: `A user added product: ${product.productName} to their wishlist`,
            entityId: product._id,
            entityType: "Product"
        };

        for (const admin of admins) {
            await Notification.create({
                ...notificationData,
                receiver: admin._id,
                sender: userId
            });
        }

        emitToAdmins("receiveNotification", {
            ...notificationData,
            createdAt: new Date()
        });

        res.status(200).json({
            message: "Product added to wishlist",
            wishlist: wishlist
        });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong"
        });
        console.log("Here is error:- ", error)
    }
});

router.delete('/:productId', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" })
        }

        wishlist.items = wishlist.items.filter(
            (item) => item.productId.toString() !== productId
        );

        wishlist.totalItems = wishlist.items.length;
        await wishlist.save();

        res.status(200).json({
            message: "Item removed from wishlist",
            wishlist
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error)
    }
})

module.exports = router