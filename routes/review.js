var express = require('express');
const { default: Review } = require('../Model/review');
const { default: Products } = require('../Model/Products');
var router = express.Router();

router.get('/', async (req, res) => {
    try {
        const review = await Review.find();
        res.status(200).json({
            message: "Successfull",
            review
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
            Comment
        });

        const reviews = await Review.find({ product: productId });

        const total = reviews.reduce((acc, item) => acc + item.rating, 0);
        const avg = total / reviews.length;

        await Products.findByIdAndUpdate(productId, {
            averageRating: avg,
            totalReviews: reviews.length
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