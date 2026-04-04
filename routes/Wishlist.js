var express = require('express');
const { isAuthenticated } = require('../middleware/requireAuth');
const { default: Wishlist } = require('../Model/Wishlist');
const { default: Products } = require('../Model/Products');
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
            wishlist: wishlist || { items: []}
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

module.exports = router