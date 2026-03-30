var express = require('express');
const { default: Auth } = require('../Model/Auth');
const passport = require('passport');
var router = express.Router()


router.get('/', async (req, res) => {
    try {
        const resData = await Auth.find();
        res.status(200).json({
            authenticate: resData
        })
    } catch (error) {
        res.status(500).json({
            message: "Error"
        })
    }
})


router.get("/me", async (req, res) => {
    try {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({ user: null, error: "Unauthorized" });
        }

        if (!req.user) {
            return res.status(404).json({ user: null, error: "User not found" });
        }

        return res.status(200).json({
            user: req.user
        });

    } catch (err) {
        console.error("GET /me error:", err);
        return res.status(500).json({
            user: null,
            error: "Internal server error"
        });
    }
});


router.post('/login', async (req, res, next) => {
    try {
        const user = await new Promise((resolve, reject) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) return reject(err);
                if (!user) {
                    return reject({
                        status: 401,
                        message: info?.message || "Invalid email or password"
                    });
                }
                resolve(user);
            })(req, res, next);
        });

        // 🔴 ROLE CHECK HERE
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied: Admins only 🚫"
            });
        }

        // login session
        await new Promise((resolve, reject) => {
            req.logIn(user, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // remove password
        const { password, ...safeUser } = user._doc;

        return res.json({
            message: "Admin Login Successful ✅",
            user: safeUser
        });

    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }
        next(err);
    }
});


module.exports = router