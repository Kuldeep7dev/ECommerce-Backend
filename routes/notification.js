var express = require('express');
const { isAuthenticated } = require('../middleware/requireAuth');
const { default: Notification } = require('../Model/Notification');
const { emitToUser } = require('../utils/socket');
var router = express.Router();


// Get all notification
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({
            receiver: userId
        }).populate("sender", "fullName email").sort({ createdAt: -1 });

        res.status(200).json({
            Success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unread notification
router.get('/user/:userId/unread', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({
            receiver: userId,
            isRead: false
        }).sort({ createdAt: -1 })

        res.status(200).json({
            Success: true,
            count: notifications.length,
            data: notifications
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.put('/read/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            {
                isRead: true,
                readAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({ Success: true, data: notification });
    } catch (error) {
        res.status(500).json({ Success: false, message: error.message });
    }
});

// Mark All as Read
router.put("/read-all/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany(
            { receiver: userId, isRead: false },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete Notification
router.delete("/:id", async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Notification deleted"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/create', async (req, res) => {
    try {
        const {
            receiver,
            sender,
            type,
            title,
            message,
            entityId,
            entityType,
        } = req.body

        const data = await Notification.create({
            receiver,
            sender: sender || null,
            type,
            title,
            message,
            entityId,
            entityType
        });

        emitToUser(receiver, "receiveNotification", data);

        res.status(201).json({
            Success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to send Notification" });
    }
})

module.exports = router