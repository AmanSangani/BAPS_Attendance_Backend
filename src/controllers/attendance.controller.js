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

    const queryDate = new Date(date); // Parse date from the body

    // Clone the queryDate to avoid mutating the original date object
    const startOfDay = new Date(
        Date.UTC(
            queryDate.getUTCFullYear(),
            queryDate.getUTCMonth(),
            queryDate.getUTCDate(),
            0,
            0,
            0,
            0,
        ),
    );
    const endOfDay = new Date(
        Date.UTC(
            queryDate.getUTCFullYear(),
            queryDate.getUTCMonth(),
            queryDate.getUTCDate(),
            23,
            59,
            59,
            999,
        ),
    );

    // Define the filter for the entire day
    const filter = {
        date: {
            $gte: startOfDay, // Greater than or equal to the start of the day
            $lt: endOfDay, // Less than the end of the day (23:59:59.999)
        },
    };

    if (mandal) {
        filter.mandal = new mongoose.Types.ObjectId(mandal); // Ensure mandal is ObjectId
    }

    console.log("Filter:", filter);

    // Fetch attendance based on filter
    const attendance = await Attendance.find(filter);

    console.log("Attendance:", attendance);

    if (!attendance.length) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    [],
                    "Attendance not found for selected Date",
                ),
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, attendance, "Attendance fetched successfully"),
        );
});

// Toggle attendance status for a SabhaUser
const toggleAttendance = asyncHandler(async (req, res) => {
    const { id, mandal, date } = req.body;

    if (!id || !mandal || !date) {
        throw new ApiError(400, "Missing required fields");
    }

    // if (req.user.role !== "admin" && req.user.role !== "SahSanchalak") {
    //     throw new ApiError(403, "Access denied. Unauthorized role");
    // }

    const sabhaUser = await SabhaUser.findOne({ customID: id });
    if (!sabhaUser) {
        throw new ApiError(404, "SabhaUser not found");
    }

    // Set the date to the start of the day (00:00:00) in UTC for consistency
    const queryDate = new Date(date);
    const startOfDay = new Date(
        Date.UTC(
            queryDate.getUTCFullYear(),
            queryDate.getUTCMonth(),
            queryDate.getUTCDate(),
            0,
            0,
            0,
            0,
        ),
    );

    // Ensure mandal is an ObjectId
    const mandalObjectId = new mongoose.Types.ObjectId(mandal);    

    // Check if attendance exists for this user, date, and mandal
    let attendance = await Attendance.findOne({
        userId: sabhaUser._id,
        date: {
            $gte: startOfDay,
            $lt: new Date(startOfDay.getTime() + 86400000),
        }, // For the entire day
        mandal: mandalObjectId,
    });

    if (!attendance) {
        // If no attendance found, create a new one
        attendance = new Attendance({
            userId: sabhaUser._id,
            date: startOfDay,
            status: "Present",
            markedBy: req.user._id,
            mandal: mandalObjectId,
        });
    } else {
        // Toggle the status
        attendance.status =
            attendance.status === "Present" ? "Absent" : "Present";
        attendance.markedBy = req.user._id;
    }

    await attendance.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, attendance, "Attendance updated successfully"),
        );
});

module.exports = {
    getAttendance,
    toggleAttendance,
};
