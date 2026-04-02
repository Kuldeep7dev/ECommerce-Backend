const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
        minlength: 6,
        trim: true
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        trim: true
    },

}, { timestamps: true });

// 🔐 HASH PASSWORD BEFORE SAVE
authSchema.pre("save", async function () {
    // Only hash password if it has been modified (or is new)
    if (!this.isModified("password")) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error; // Let Mongoose handle the error
    }
});

// 🔐 COMPARE PASSWORD METHOD
authSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
    

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;