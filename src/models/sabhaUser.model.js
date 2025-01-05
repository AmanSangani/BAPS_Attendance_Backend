const mongoose = require("mongoose");

const sabhaUserSchema = new mongoose.Schema(
    {
        customID: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        DOB: { type: Date }, // Date of Birth
        address: { type: String }, // Address
        designation: { type: String }, // Role or designation
        mandal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Mandal",
            required: true,
        }, // References Mandal schema
        activeStatus: { type: Boolean, default: true }, // Active/Inactive
        lastAcademicDetails: { type: String }, // Last academic details
        skills: { type: [String] }, // Skills
        isYST: { type: Boolean, default: false }, // YST Sabha
        isRaviSabha: { type: Boolean, default: false }, // Ravi Sabha
        image: { type: String }, // Image link
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // References the user who created the entry
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" }, // Auto-fill timestamps
    },
);

const SabhaUser = mongoose.model("SabhaUser", sabhaUserSchema);

module.exports = { SabhaUser };
