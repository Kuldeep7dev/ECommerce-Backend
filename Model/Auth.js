import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        trim: true
    },

}, { timestamps: true });

const Auth = mongoose.model("Auth", authSchema);
export default Auth;
