const express = require('express');
const passport = require('passport');
const { validateSignup, validateLogin } = require('../middleware/validate');
const { isAuthenticated, isAdmin } = require('../middleware/requireAuth');
const handleError = require('../utils/handleError');
const { default: Auth } = require('../Model/Auth');
const Notification = require('../Model/Notification');

const router = express.Router();

router.get('/', isAdmin, async (req, res) => {
    try {
        const users = await Auth.find().select('-password');
        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users" });
    }
});

router.get('/get-count', isAdmin, async (req, res) => {
    try {
        const data = await Auth.countDocuments();
        res.status(200).json({
            message: "Users retrieved successfully",
            user: data
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users" });
    }
})

router.put('/shipping-address/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { street, city, state, postalCode, country } = req.body;

        if (
            req.user.role !== "admin" &&
            req.user._id.toString() !== id
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const user = await Auth.findByIdAndUpdate(
            id,
            {
                shippingAddress: {
                    street,
                    city,
                    state,
                    postalCode,
                    country
                }
            },
            { new: true }
        );

        res.status(200).json({
            message: "Address updated successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating address"
        });
    }
});

router.post('/signup', validateSignup, async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password } = req.body;
        const user = await Auth.create({
            fullName,
            email,
            password,
            phoneNumber,
            role: "user"
        });

        await Notification.create({
            receiver: user._id,
            type: "SYSTEM",
            title: "Welcome to Bravima! 🎉",
            message: `Hi ${fullName}, we're excited to have you here! Start exploring our latest collections.`
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: "User registered successfully ✅",
            user: userResponse
        });
    } catch (error) {
        console.log('Signup error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            keyValue: error.keyValue
        });
        const errorMessage = handleError(error);
        res.status(error.code === 11000 ? 400 : 500).json({
            message: errorMessage,
            error: (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'DEVELOPMENT') ? error.message : undefined
        });
    }
});

router.post('/login', validateLogin, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info?.message || "Login failed" });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);

            const userResponse = user.toObject();
            delete userResponse.password;

            return res.json({
                message: "Login successful ✅",
                user: userResponse
            });
        });
    })(req, res, next);
});


router.get('/me', isAuthenticated, (req, res) => {
    res.status(200).json({
        user: req.user
    });
});


router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            res.json({ message: "Logged out successfully ✅" });
        });
    });
});


router.post('/', isAdmin, async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;

        const user = await Auth.create({
            fullName,
            email,
            password,
            phoneNumber,
            role: role || "user"
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: "User created successfully ✅",
            user: userResponse
        });
    } catch (error) {
        console.error('Admin user creation error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        const errorMessage = handleError(error);
        res.status(error.code === 11000 ? 400 : 500).json({
            message: errorMessage,
            error: (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'DEVELOPMENT') ? error.message : undefined
        });
    }
});


router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: "Access denied" });
        }

        const user = await Auth.findById(id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "User retrieved successfully",
            user
        });
    } catch (error) {
        res.status(400).json({ message: "Error retrieving user" });
    }
});


router.put('/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (req.user.role !== 'admin') {
            delete updates.role;
        }

        delete updates.password;

        const updatedUser = await Auth.findByIdAndUpdate(id, updates, { new: true }).select('-password');
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating user" });
    }
});


router.delete('/delete/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await Auth.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "User deleted successfully",
            user: deletedUser
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
});

module.exports = router;