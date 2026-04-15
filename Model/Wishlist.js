import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    // price: {
    //     type: Number,
    //     required: true
    // },
}, { _id: false });

const wishListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        unique: true
    },

    items: [wishlistItemSchema],

    totalItems: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const Wishlist = mongoose.model("Wishlist", wishListSchema);
export default Wishlist