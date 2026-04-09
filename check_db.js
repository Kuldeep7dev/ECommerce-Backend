const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Auth = require('./Model/Auth');
const Notification = require('./Model/Notification');

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const userCount = await Auth.countDocuments();
        console.log('Total Users:', userCount);

        const users = await Auth.find().limit(5);
        console.log('Recent Users:', users.map(u => ({ id: u._id, email: u.email, role: u.role })));

        const notiCount = await Notification.countDocuments();
        console.log('Total Notifications:', notiCount);

        const recentNoti = await Notification.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent Notifications:', recentNoti.map(n => ({ id: n._id, title: n.title, receiver: n.receiver })));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
