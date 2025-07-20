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

// Fetch attendance with optional date and mandal filter
const getAttendanceForyuvaRaviSabha = asyncHandler(async (req, res) => {
    const { date, isRaviSabha } = req.body;

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
        isRaviSabha : isRaviSabha ? true : false,
    };

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

// Toggle attendance status for YuvaRaviSabha
const toggleAttendanceYuvaRaviSabha = asyncHandler(async (req, res) => {
    const { id, isRaviSabha, date } = req.body;

    if (!id || (!isRaviSabha) || !date) {
        throw new ApiError(400, "Missing required fields");
    }

    const sabhaUser = await SabhaUser.findOne({ customID: id, isRaviSabha: true });
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

    // Check if attendance exists for this user, date, and mandal
    let attendance = await Attendance.findOne({
        userId: sabhaUser._id,
        date: {
            $gte: startOfDay,
            $lt: new Date(startOfDay.getTime() + 86400000),
        }, // For the entire day
        isRaviSabha: isRaviSabha ? true : false,
    });

    if (!attendance) {
        // If no attendance found, create a new one
        attendance = new Attendance({
            userId: sabhaUser._id,
            date: startOfDay,
            status: "Present",
            markedBy: req.user._id,
            isRaviSabha: isRaviSabha ? true : false,
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

const getSundaysInMonth = (year, month) => {
    // The month in JavaScript's Date object is 0-indexed (0-11), 
    // so we subtract 1 from the MongoDB month (1-12).
    const date = new Date(year, month - 1, 1);
    let sundays = 0;
    
    // Loop through all days of the given month.
    while (date.getMonth() === month - 1) {
        // getDay() returns 0 for Sunday.
        if (date.getDay() === 0) {
            sundays++;
        }
        // Move to the next day.
        date.setDate(date.getDate() + 1);
    }
    return sundays;
};


const getMonthlyAttendanceReport = asyncHandler(async (req, res) => {
    // This pipeline gathers the number of times each user was present per month.
    const monthlyPresentCounts = await Attendance.aggregate([
        // Step 1: Filter for only Ravi Sabha attendance records.
        {
            $match: {
                isRaviSabha: true,
                status: "Present", // We only need to count 'Present' records.
            },
        },
        // Step 2: Group by user, year, and month to count present sabhas.
        {
            $group: {
                _id: {
                    userId: "$userId",
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                },
                presentCount: { $sum: 1 },
            },
        },
        // Step 3: Group again to collect all monthly stats for each user.
        {
            $group: {
                _id: "$_id.userId",
                monthlyStatsRaw: {
                    $push: {
                        year: "$_id.year",
                        month: "$_id.month",
                        presentCount: "$presentCount",
                    },
                },
            },
        },
        // Step 4: Look up user details (name, customID) from the SabhaUser collection.
        {
            $lookup: {
                from: "sabhausers", // The actual name of your SabhaUsers collection in MongoDB.
                localField: "_id",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        // Step 5: Unwind the userDetails array and project the final fields.
        {
            $unwind: "$userDetails",
        },
        {
            $project: {
                _id: 0,
                userId: "$_id",
                customID: "$userDetails.customID",
                name: { $concat: ["$userDetails.name", " ", "$userDetails.surname"] },
                monthlyStatsRaw: "$monthlyStatsRaw",
            },
        },
        // Optional: Sort by customID.
        {
            $sort: { customID: 1 }
        }
    ]);

    if (!monthlyPresentCounts.length) {
        throw new ApiError(404, "No attendance data found to generate a report.");
    }

    // --- Post-processing to calculate percentage and ensure all months are present ---

    // First, find all unique months across all users in the dataset
    const allMonths = new Set();
    monthlyPresentCounts.forEach(user => {
        user.monthlyStatsRaw.forEach(stat => {
            allMonths.add(`${stat.year}-${stat.month}`);
        });
    });
    const sortedMonths = Array.from(allMonths).sort();

    // Now, map over each user and ensure they have a stat for every month in the dataset
    const finalReport = monthlyPresentCounts.map(user => {
        const userStatsMap = new Map(
            user.monthlyStatsRaw.map(s => [`${s.year}-${s.month}`, s.presentCount])
        );

        const calculatedMonthlyStats = sortedMonths.map(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
            const presentCount = userStatsMap.get(monthKey) || 0;
            const totalSundays = getSundaysInMonth(year, month);
            const percentage = totalSundays > 0 ? (presentCount / totalSundays) * 100 : 0;
            
            return {
                year: year,
                month: month,
                percentage: percentage,
            };
        });

        return {
            userId: user.userId,
            customID: user.customID,
            name: user.name,
            monthlyStats: calculatedMonthlyStats, // This is the final array the frontend expects.
        };
    });


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                finalReport,
                "Monthly attendance report generated successfully"
            )
        );
});


module.exports = {
    getAttendance,
    toggleAttendance,
    getAttendanceForyuvaRaviSabha,
    toggleAttendanceYuvaRaviSabha,
    getMonthlyAttendanceReport,
};
