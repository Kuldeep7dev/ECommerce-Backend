import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        default: null
    },
    type: {
        type: String,
        enum: [
            "order_created",
            "order_cancelled",
            "payment_failed",
            "stock_low",
            "product_added",
            "refund_requested",
            "system"
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    entityModel: {
        type: String,
        enum: ["Order", "Product", "User"],
        default: null
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date,
        default: null
    }
}, { timestamps: true }
);

notificationSchema.index({ receiver: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
