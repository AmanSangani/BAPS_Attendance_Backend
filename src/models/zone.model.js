const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
    {
        zoneName: { type: String, required: true },
        city: { type: String, required: true },
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

const Zone = mongoose.model("Zone", zoneSchema);

module.exports = { Zone };
