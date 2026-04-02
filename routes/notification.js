var express = require('express');
const Notification = require('../Model/Notification');
var router = express.Router();

router.get('/', async (req, res) => {
    try {
        const resGet = await Notification.find();
        res.status(200).json({
            message: "Successfull",
            notifications: resGet
        })
    } catch (error) {
        res.status(500).json({
            message: "Error"
        });
    };
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const getDataToId = await Notification.findById(id)
        res.status(200).json({
            message: "Successfull",
            notifications: getDataToId
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Error to get data to id"
        })
    }
})

router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const resPost = await Notification.create(data);
        res.status(201).json({
            message: "Successfull",
            notifications: resPost
        })
    } catch (error) {
        res.status(500).json({
            message: "Error"
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteData = await Notification.findByIdAndDelete(id);
        res.status(200).json({
            message: "Successfully delete Notification",
            notifications: deleteData
        })
    } catch (error) {
        res.status(500).json({
            message: "Some error to delete notifications"
        })
    }
})

module.exports = router