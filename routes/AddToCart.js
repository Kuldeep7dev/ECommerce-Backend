var express = require('express');
const { default: Products } = require('../Model/Products');
const { default: Cart } = require('../Model/Cart');
const { isAuthenticated } = require('../middleware/requireAuth');
var router = express.Router();


router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName price image brand'
        });

        res.status(200).json({
            message: "Cart fetched",
            cart: cart || { items: [], totalItems: 0, totalPrice: 0 }
        });
    } catch (error) {
        res.status(500).json({ message: "Something error" });
    }
});


router.post('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;
        console.log("All things is here", quantity);


        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        };

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [
                    {
                        productId,
                        quantity,
                        price: product.price,
                    },
                ],
                totalItems: quantity,
                totalPrice: product.price * quantity,
            });

            return res.status(201).json(cart);
        }

        const existingItem = cart.items.find(
            (item) => item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.price,
            });
        };

        cart.totalPrice = cart.items.reduce(
            (sum, item) => sum += item.quantity * item.price,
            0
        );

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log(error)
    }
});

router.delete('/:productId', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Remove the item
        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== productId
        );

        // Recalculate totals
        cart.totalPrice = cart.items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
        );
        cart.totalItems = cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        await cart.save();

        res.status(200).json({
            message: "Item removed from cart",
            cart
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;