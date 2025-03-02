const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
    {
        designationName: { type: String, required: true, unique: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // References the user who created the mandal
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" },
    },
);

const Designation = mongoose.model("Designation", designationSchema);

module.exports = { Designation };
