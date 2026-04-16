var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const { default: Contact } = require('../Model/Contact');
const contactTemplate = require('../Templete/contactTemplate ');

router.get('/', async (req, res) => {
    try {
        const data = await Contact.find();
        res.status(200).json({
            message: "Successful",
            data: data
        })
    } catch (error) {
        res.status(500).json({
            message: "Error to get"
        })
    }
});

router.delete('/delete-contact/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Contact.findByIdAndDelete(id);
        res.status(200).json({
            message: "Successfully delete",
            data: data
        })
    } catch (error) {
        res.status(500).json({
            message: "Error to delete"
        })
    }
})

router.post('/message', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const newMessage = await Contact.create({
            name,
            email,
            message
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "New Bravima Message",
            html: contactTemplate({
                name,
                email,
                message,
                time: new Date().toLocaleString()
            })
        })

        res.status(200).json({
            message: "Successful",
            data: newMessage
        });

    } catch (error) {
        res.status(500).json({
            message: "Error to send message"
        })
        console.log("Yah kya error h", error);
    }
})

module.exports = router