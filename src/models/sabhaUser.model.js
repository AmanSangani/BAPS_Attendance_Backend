const mongoose = require("mongoose");

const sabhaUserSchema = new mongoose.Schema(
    {
        customID: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        fatherName: { type: String }, // New field: Father's Name
        surname: { type: String }, // New field: Surname
        mobileNumber: { type: String, required: true },
        mobileNumber2: { type: String }, // New field: Alternate Mobile Number
        DOB: { type: Date }, // Date of Birth
        address: { type: String }, // Address
        designation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Designation",
            required: false,
        },
        mandal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Mandal",
            required: true,
        }, // References Mandal schema
        zone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Zone",
            required: true,
        }, // References Zone schema
        activeStatus: { type: Boolean, default: true }, // Active/Inactive
        lastAcademicDetails: { type: String }, // Last academic details
        bapsId: { type: String }, // New field: BAPS ID
        skills: { type: [String] }, // Skills
        remarks: { type: String }, // New field: Additional Remarks
        isYST: { type: Boolean, default: false }, // YST Sabha
        isRaviSabha: { type: Boolean, default: false }, // Ravi Sabha
        image: { type: String }, // Image link
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // References the user who created the entry
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }, // References the user who updates the entry
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" }, // Auto-fill timestamps
    },
);

const SabhaUser = mongoose.model("SabhaUser", sabhaUserSchema);

module.exports = { SabhaUser };
