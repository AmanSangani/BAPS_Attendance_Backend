const mongoose = require("mongoose");

const mandalSchema = new mongoose.Schema(
    {
        mandalName: { type: String, required: true, unique: true },
        initials: { type: String, required: true, unique: true }, // Used to generate IDs
        zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Zone",
            required: true,
        },
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

const Mandal = mongoose.model("Mandal", mandalSchema);

module.exports = { Mandal };
