const { ApiError } = require("../utils/ApiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { SabhaUser } = require("../models/sabhaUser.model.js");
const { Mandal } = require("../models/mandal.model.js");
const { Zone } = require("../models/zone.model.js");
const mongoose = require("mongoose");

// Add a new SabhaUser
const addUser = asyncHandler(async (req, res) => {
    const {
        name,
        fatherName,
        surname,
        mobileNumber,
        mobileNumber2,
        DOB,
        address,
        designation,
        mandal,
        zone,
        activeStatus,
        lastAcademicDetails,
        bapsId,
        skills,
        remarks,
        isYST,
        isRaviSabha,
        image,
    } = req.body;

    if (!name || !mobileNumber || !zone || !mandal) {
        throw new ApiError(
            400,
            "Name, mobileNumber, zone, and mandal are required.",
        );
    }

    console.log(req.body.isRaviSabha);
    

    // Validate zone and mandal
    const zoneData = await Zone.findById(zone);
    if (!zoneData) throw new ApiError(404, "Zone not found.");

    const mandalData = await Mandal.findById(mandal);
    if (!mandalData) throw new ApiError(404, "Mandal not found.");

    // Generate customID for selected mandal
    const initials = mandalData.initials;
    const lastUser = await SabhaUser.aggregate([
        { $match: { mandal: new mongoose.Types.ObjectId(mandal) } },
        {
            $addFields: {
                numericCustomId: {
                    $toInt: { $substr: ["$customID", initials.length, -1] },
                },
            },
        },
        { $sort: { numericCustomId: -1 } },
        { $limit: 1 },
    ]);
    const lastCustomID = lastUser.length > 0 ? lastUser[0].numericCustomId : 0;
    const newCustomID = `${initials}${lastCustomID + 1}`;

    // Create new user in selected mandal
    const newUser = await SabhaUser.create({
        customID: newCustomID,
        name,
        fatherName: fatherName || "",
        surname: surname || "",
        mobileNumber,
        mobileNumber2: mobileNumber2 || "",
        DOB,
        address,
        designation,
        mandal,
        zone,
        activeStatus: activeStatus !== undefined ? activeStatus : true,
        lastAcademicDetails,
        bapsId: bapsId || "",
        skills,
        remarks: remarks || "",
        isYST: isYST !== undefined ? isYST : false,
        isRaviSabha: isRaviSabha !== undefined ? isRaviSabha : false,
        image: image || "",
        createdBy: req.user._id,
        updatedBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newUser, "User added successfully."));
});

// Fetch SabhaUsers based on mandal ID
const getUsers = asyncHandler(async (req, res) => {
    const { mandalId } = req.body; // Assuming mandalId is passed in the request body

    // Step 1: Find the mandal by its ObjectId
    const mandal = await Mandal.findById(mandalId); // Assuming 'Mandal' is the model for the mandal collection

    if (!mandal) {
        throw new ApiError(404, "Mandal not found");
    }

    // Step 2: Query SabhaUsers based on the mandal ObjectId
    const users = await SabhaUser.find({ mandal: mandal._id }).populate("mandal").lean(); // Populate 'createdBy' with name and email

    if (!users.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "Users not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

// Add a Many SabhaUser
const bulkAdd = asyncHandler(async (req, res) => {
    try {
        const users = req.body.users; // Expecting an array of users in the request body

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({
                error: "Invalid input. Provide a non-empty array of users.",
            });
        }

        // Add createdBy field to each user
        const usersWithCreatedBy = users.map((user) => ({
            ...user,
            createdBy: req.user._id,
        }));

        console.log("users : ---", usersWithCreatedBy);

        // Insert users into the database
        const result = await SabhaUser.insertMany(usersWithCreatedBy);

        console.log("Result : --- ", result);

        return res.status(201).json({
            message: `${result.length} users added successfully`,
            data: result,
        });
    } catch (error) {
        console.error("Error adding users:", error);
        return res.status(500).json({ error: "Failed to add users" });
    }
});

// Update an existing SabhaUser
const updateUser = asyncHandler(async (req, res) => {
    const {
        customID,
        name,
        fatherName, // New field
        surname, // New field
        mobileNumber,
        mobileNumber2, // New field
        DOB,
        address,
        designation,
        mandal,
        zone,
        activeStatus,
        lastAcademicDetails,
        bapsId, // New field
        skills,
        remarks, // New field
        isYST,
        isRaviSabha,
        image,
    } = req.body;

    // Find the user by customID
    const user = await SabhaUser.findOne({ customID });

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Validate zone ID
    if (zone) {
        const zoneData = await Zone.findById(zone);
        if (!zoneData) {
            throw new ApiError(404, "Zone not found.");
        }
    }

    // Validate the mandal if it's being updated
    if (mandal) {
        const mandalData = await Mandal.findById(mandal);
        if (!mandalData) {
            throw new ApiError(404, "Mandal not found.");
        }
    }

    // Update user fields
    user.name = name || user.name;
    user.fatherName = fatherName || user.fatherName;
    user.surname = surname || user.surname;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.mobileNumber2 = mobileNumber2 || user.mobileNumber2;
    user.DOB = DOB || user.DOB;
    user.address = address || user.address;
    user.designation = designation || user.designation;
    user.mandal = mandal || user.mandal;
    user.zone = zone || user.zone;
    user.activeStatus =
        activeStatus !== undefined ? activeStatus : user.activeStatus;
    user.lastAcademicDetails = lastAcademicDetails || user.lastAcademicDetails;
    user.bapsId = bapsId || user.bapsId;
    user.skills = skills || user.skills;
    user.remarks = remarks || user.remarks;
    user.isYST = isYST !== undefined ? isYST : user.isYST;
    user.isRaviSabha =
        isRaviSabha !== undefined ? isRaviSabha : user.isRaviSabha;
    user.image = image || user.image;

    // Set the updatedBy field with req.user._id
    user.updatedBy = req.user._id;

    // Save updated user
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User updated successfully."));
});

const bulkUpdate = asyncHandler(async (req, res) => {
    const users = req.body.users; // Expecting an array of users in the request body

    if (!Array.isArray(users) || users.length === 0) {
        throw new ApiError(
            400,
            "Invalid input. Provide a non-empty array of users.",
        );
    }

    const updatedUsers = [];
    const errors = [];

    // Loop through the users array and update each user
    for (let userData of users) {
        const { customID, ...updateFields } = userData;

        // Find the user by ID
        const user = await SabhaUser.findOne({ customID: customID });

        console.log(user);

        if (!user) {
            errors.push(`User with ID ${userId} not found.`);
            continue;
        }

        // Validate the mandal if it's being updated
        if (updateFields.mandal) {
            const mandalData = await Mandal.findById(updateFields.mandal);
            if (!mandalData) {
                errors.push(
                    `Mandal with ID ${updateFields.mandal} not found for user ${userId}.`,
                );
                continue;
            }
        }

        // Update the user fields
        Object.assign(user, updateFields);

        // Set the updatedBy field with req.user._id
        user.updatedBy = req.user._id;

        // Save the updated user
        await user.save();
        updatedUsers.push(user);
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Some updates failed.",
            errors,
        });
    }

    return res.status(200).json({
        message: `${updatedUsers.length} users updated successfully.`,
        data: updatedUsers,
    });
});

// Fetch SabhaUsers based on mandal ID
const testGet = asyncHandler(async (req, res) => {
    const users = await SabhaUser.aggregate([
        {
            $addFields: {
                numericCustomId: {
                    $toInt: { $substr: ["$customID", 2, -1] }, // Extract numeric part after "YR"
                },
            },
        },
        { $sort: { numericCustomId: -1 } }, // Sort by the numeric part of customID
        {
            $project: {
                _id: 0, // Exclude the MongoDB `_id` field
                customID: 1, // Include the customID field
                numericCustomId: 1, // Include the numericCustomId field
            },
        },
    ]);

    if (!users.length) {
        throw new ApiError(404, "No users found for the specified mandal");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

// Fetch SabhaUser by customID
const getSabhaUserByCustomID = async (req, res) => {
    const { customID } = req.params;

    try {
        // Find the user by customID
        const sabhaUser = await SabhaUser.findOne({ customID });

        if (!sabhaUser) {
            return res.status(404).json({ message: "SabhaUser not found" });
        }

        // Return the user details
        res.status(200).json(
            new ApiResponse(200, sabhaUser, "User fetched successfully"),
        );
    } catch (error) {
        console.error("Error fetching SabhaUser by customID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete SabhaUser by ID
const deleteSabhaUser = async (req, res) => {
    const { customID } = req.params; // userId comes from the request parameters

    try {
        const sabhaUser = await SabhaUser.findOne({ customID });

        if (!sabhaUser) {
            return res.status(404).json({ message: "SabhaUser not found" });
        }

        // Find and delete the user
        const user = await SabhaUser.findByIdAndDelete(sabhaUser._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting sabha user:", error);
        return res.status(500).json({ message: "Error deleting user" });
    }
};

module.exports = {
    addUser,
    getUsers,
    bulkAdd,
    updateUser,
    bulkUpdate,
    testGet,
    getSabhaUserByCustomID,
    deleteSabhaUser,
};
