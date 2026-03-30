var express = require('express');
const { default: Auth } = require('../Model/Auth');
var bcrypt = require('bcrypt');
var router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await Auth.find();
        res.status(200).json({
            message: "Successfully get the user data",
            user: data
        })
    } catch (error) {
        res.status(500).json({
            message: "Error when data get"
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Auth.findById(id);
        res.status(200).json({
            message: "Successfully get id based data",
            user: data
        })
    } catch (error) {
        res.status(400).json({
            message: "Error when data get by id"
        })
    }
})

router.get('/view/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const viewData = await Auth.findById(id);

        if (!viewData) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "Successfull",
            user: viewData
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error'
        });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updateData = await Auth.findByIdAndUpdate(id, data);
        res.status(200).json({
            message: "Successfully update the user data",
            user: updateData
        })
    } catch (error) {
        res.status(500).json({
            message: "Error when update the data"
        })
    }
})

router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;


        if (!fullName || !email || !phoneNumber || !password) {
            return res.status(400).json({
                message: "All fiels is required"
            });
        };

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const user = await Auth.create({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            role: role || "user"
        });
        res.status(201).json({
            message: "user post successfully",
            user: user
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Error'
        });
    };
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteUser = await Auth.findByIdAndDelete(id);
        res.status(200).json({
            message: "successfully delete users",
            user: deleteUser
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server error while delete users'
        });
    }
})

router.post('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return res.status(500).json({ message: "Logout failed" })
        }

        req.session.destroy(() => {
            res.clearCookie("connect.sid")
            res.json({ message: "Logged out successfully ✅" })
        })
    })
});


module.exports = router;