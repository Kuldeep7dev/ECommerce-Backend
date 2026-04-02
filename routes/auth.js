const express = require('express');
const passport = require('passport');
const { validateSignup, validateLogin } = require('../middleware/validate');
const { isAuthenticated, isAdmin } = require('../middleware/requireAuth');
const handleError = require('../utils/handleError');
const Auth = require('../Model/Auth');

const router = express.Router();

router.post('/signup', validateSignup, async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;
        const user = await Auth.create({
            fullName,
            email,
            password,
            phoneNumber,
            role: "user" // ✅ Always default to user for public signup
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

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
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

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', isAuthenticated, (req, res) => {
    res.status(200).json({
        user: req.user
    });
});

/**
 * @route   POST /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            res.json({ message: "Logged out successfully ✅" });
        });
    });
});

/**
 * @route   POST /auth/
 * @desc    Create a new user (Admin only)
 * @access  Admin
 */
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

/**
 * @route   GET /auth/users
 * @desc    Get all users
 * @access  Admin
 */
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

/**
 * @route   GET /auth/:id
 * @desc    Get user by ID
 * @access  Admin/Self
 */
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        // Only allow admin or the user themselves to view their details
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

/**
 * @route   PUT /auth/update/:id
 * @desc    Update user details
 * @access  Admin/Self
 */
router.put('/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Only allow admin or the user themselves to update
        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Prevent changing sensitive fields unless admin
        if (req.user.role !== 'admin') {
            delete updates.role;
        }

        // Don't update password here (should be a separate route)
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

/**
 * @route   DELETE /auth/delete/:id
 * @desc    Delete user
 * @access  Admin
 */
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