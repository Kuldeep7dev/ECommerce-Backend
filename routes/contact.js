var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const { default: Contact } = require('../Model/Contact');
const contactTemplate = require('../Templete/contactTemplate ');

router.post('/message', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        console.log(name, email, message)

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