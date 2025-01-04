const { ApiError } = require("../utils/ApiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { Attendance } = require("../models/attendance.model.js");
const { SabhaUser } = require("../models/sabhaUser.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const mongoose = require("mongoose");

// Fetch attendance with optional date and mandal filter
const getAttendance = asyncHandler(async (req, res) => {
    const { date, mandal } = req.body;

    if (!date) {
        throw new ApiError(400, "Date is required");
    }

    const queryDate = new Date(date);
    queryDate.setHours(12, 12, 0, 0); // Set consistent time for comparison

    const filter = {
        date: { $eq: queryDate },
        markedBy: req.user._id,
    };

    if (mandal) {
        filter.mandal = mandal;
    }

    const attendance = await Attendance.find(filter);

    if (!attendance.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "Attendance not found for selected Date")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, attendance, "Attendance fetched successfully")
    );
});

// Toggle attendance status for a SabhaUser
const toggleAttendance = asyncHandler(async (req, res) => {
    const { id, mandal, date } = req.body;

    if (!id || !mandal || !date) {
        throw new ApiError(400, "Missing required fields");
    }

    if (req.user.role !== "admin" && req.user.role !== "SahSanchalak") {
        throw new ApiError(403, "Access denied. Unauthorized role");
    }

    const sabhaUser = await SabhaUser.findOne({ customID: id });
    if (!sabhaUser) {
        throw new ApiError(404, "SabhaUser not found");
    }

    const queryDate = new Date(date);
    queryDate.setHours(12, 12, 0, 0); // Consistent time for comparison

    let attendance = await Attendance.findOne({
        userId: sabhaUser._id,
        date: queryDate,
        mandal: mandal,
    });

    if (!attendance) {
        attendance = new Attendance({
            userId: sabhaUser._id,
            date: queryDate,
            status: "Present",
            markedBy: req.user._id,
            mandal: mandal,
        });
    } else {
        attendance.status =
            attendance.status === "Present" ? "Absent" : "Present";
        attendance.markedBy = req.user._id;
    }

    await attendance.save();

    return res.status(200).json(
        new ApiResponse(200, attendance, "Attendance updated successfully")
    );
});

module.exports = {
    getAttendance,
    toggleAttendance,
};
