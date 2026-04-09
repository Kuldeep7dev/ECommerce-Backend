const { Server } = require("socket.io");

let io;
const users = {};

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:8080",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("register", (userId, userRole) => {
            // Join a private room for this user
            socket.join(`user_${userId}`);
            
            // If the user is an admin, join the admins room
            if (userRole === "admin") {
                socket.join("admins");
                console.log(`Admin joined admins room: ${userId}`);
            }
            
            console.log(`User registered: ${userId} (Role: ${userRole}) joined user_${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

const emitToAdmins = (event, data) => {
    if (io) {
        io.to("admins").emit(event, data);
    }
};

module.exports = { initSocket, getIo, emitToUser, emitToAdmins };
