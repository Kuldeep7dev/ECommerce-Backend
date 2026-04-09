const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
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
            "ORDER",
            "PAYMENT",
            "MESSAGE",
            "PROMOTION",
            "SYSTEM",
            "SECURITY"
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
    entityType: {
        type: String,
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
module.exports = Notification;