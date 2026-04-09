var express = require('express');
const Products = require('../Model/Products');
const Review = require('../Model/Review');
const Auth = require('../Model/Auth');
const Notification = require('../Model/Notification');
const { emitToAdmins } = require('../utils/socket');
var router = express.Router();

router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().populate("user", "fullName email");
        res.status(200).json({
            message: "Successful",
            review: reviews
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
});

// Get reviews for a specific product
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ product: productId }).populate("user", "fullName email");
        res.status(200).json({
            message: "Successful",
            review: reviews
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
});

router.post('/', async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        const existing = await Review.findOne({
            user: userId,
            product: productId
        })

        if (existing) {
            return res.status(400).json({
                message: "You already reviewed this product"
            })
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating,
            comment
        });

        const reviews = await Review.find({ product: productId });

        const total = reviews.reduce((acc, item) => acc + item.rating, 0);
        const avg = total / reviews.length;

        await Products.findByIdAndUpdate(productId, {
            averageRating: avg,
            totalReviews: reviews.length
        });

        // Notify Admins
        const admins = await Auth.find({ role: 'admin' });
        const notificationData = {
            type: "SYSTEM",
            title: "New Product Review ⭐",
            message: `A new ${rating}-star review was posted for product ID: ${productId}`,
            entityId: review._id,
            entityType: "Review"
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

        res.status(201).json({
            message: "Review added",
            review
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})

module.exports = router