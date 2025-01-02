const mongoose = require("mongoose");

const sabhaUserSchema = new mongoose.Schema(
    {
        customID: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        mandal: { type: String, required: true }, // New field 'mandal'
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // New field 'createdBy' (references the user who created the entry)
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" }, // Auto-fill createdAt and modifiedAt
    },
);


const SabhaUser = mongoose.model("SabhaUser", sabhaUserSchema);

module.exports = { SabhaUser };
