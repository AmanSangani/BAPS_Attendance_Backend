const { ApiError } = require("../utils/ApiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { SabhaUser } = require("../models/sabhaUser.model.js");

// Add a new SabhaUser
const addUser = asyncHandler(async (req, res) => {
    const { customID, name, mobileNumber, mandal } = req.body;

    if (!customID || !name || !mobileNumber || !mandal) {
        throw new ApiError(400, "All fields are required");
    }

    const newUser = await SabhaUser.create({
        customID,
        name,
        mobileNumber,
        mandal,
        createdBy: req.user._id, // Set the logged-in user as the creator
    });

    return res.status(201).json(
        new ApiResponse(201, newUser, "User added successfully")
    );
});


// Fetch SabhaUsers with optional mandal filter
const getUsers = asyncHandler(async (req, res) => {
    const { mandal } = req.body;

    const query = mandal ? { mandal } : {}; // Add mandal filter if provided

    const users = await SabhaUser.find(query).populate(
        "createdBy",
        "name email"
    ); // Populate 'createdBy' with name and email

    if (!users.length) {
        throw new ApiError(404, "No users found");
    }

    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    );
});


// Add a Many SabhaUser
const bulkAdd = asyncHandler(async (req, res) => {
    try {
        const users = req.body.users; // Expecting an array of users in the request body
    
        if (!Array.isArray(users) || users.length === 0) {
            return res
                .status(400)
                .json({
                    error: "Invalid input. Provide a non-empty array of users.",
                });
        }
    
        
        // Add createdBy field to each user
        const usersWithCreatedBy = users.map(user => ({
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




module.exports = {
    addUser,
    getUsers,
    bulkAdd
};
