const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    date: { 
      type: Date, 
      required: true,
      set: (v) => new Date(v).setHours(12, 0, 0, 0), // Ensure date is stored with time set to 00:00:00 for consistency
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "SabhaUser", 
      required: true 
    }, // Reference to the SabhaUser who is marked present or absent
    mandal: { 
      type: String, 
      required: true 
    }, // Mandal name/ID associated with the attendance
    status: { 
      type: String, 
      enum: ["Present", "Absent"], 
      required: true 
    }, // Attendance status (Present or Absent)
    markedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // The User (admin/SahSanchalak) who marked the attendance
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);