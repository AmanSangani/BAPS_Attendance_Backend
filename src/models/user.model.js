const mongoose = require("mongoose");
const ROLES = require("../config/roles.js"); // Import the roles configuration

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: Object.values(ROLES), // Use the roles from the config
            default: ROLES.SAHSSANCHALAK, // Default role if none is provided
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
