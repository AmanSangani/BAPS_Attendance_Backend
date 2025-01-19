const { ApiError } = require("../utils/ApiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { User } = require("../models/user.model.js");
const { Mandal } = require("../models/mandal.model.js");
const { uploadOnCloud } = require("../utils/cloudService.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ROLES = require("../config/roles");
const bcrypt = require("bcrypt");

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log("--------------------------------");
        // console.log(accessToken, refreshToken);
        // console.log("--------------------------------");

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // const rr = await User.findById(userId);
        // console.log(rr);

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Access and Refresh Token Error");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, name, email, password, role } = req.body;

    console.log(req.body);

    if (
        [username, name, email, password, role].some(
            (field) => field?.trim() === "",
        )
    ) {
        throw new ApiError(400, "All Fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        console.log("Existed User : ", existedUser);
        throw new ApiError(409, "User already exists");
    }

    if (role && !Object.values(ROLES).includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );

    console.log(createdUser);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating the user");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    const user = await User.findOne({
        $or: [{ username }],
    });

    if (!user) {
        throw new ApiError(404, "User Doesn't Exist");
    }

    // const isPasswordValid = await user.isPasswordCorrect(password);
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
    );

    // console.log("--------------------------------");
    // console.log(accessToken, refreshToken);
    // console.log("--------------------------------");

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );

    console.log(
        "User logged in : ",
        loggedInUser._id,
        " : username --> ",
        loggedInUser.username,
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User Logged in Successfully",
            ),
        );
});

const updatePassword = asyncHandler(async (req, res) => {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    user.password = newPassword;

    // Save the updated user
    await user.save();

    // Return the hashed password in the response
    return res.status(200).json({
        message: "Password updated successfully",
        hashedPassword: user.password,
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find().select('_id name'); // Select relevant fields
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found.' });
        }

        return res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully.'));
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching users.', error: error.message });
    }
});


/**
 * Add Multiple Mandals to Accessible Mandals for a User
 * @route PUT /api/users/:userId/accessible-mandals/add
 * @access Admin
 */
const addMandalToAccessibleMandals = asyncHandler(async (req, res) => {
    const { userId, mandalIds } = req.body; // Array of Mandal IDs to be added

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format." });
    }

    // Validate mandalIds (ensure it's an array of ObjectIds)
    if (
        !Array.isArray(mandalIds) ||
        mandalIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
        return res
            .status(400)
            .json({ message: "Invalid Mandal ID format(s)." });
    }

    // Check if the mandals exist in the database
    const mandals = await Mandal.find({ _id: { $in: mandalIds } });
    if (mandals.length !== mandalIds.length) {
        return res
            .status(404)
            .json({ message: "One or more mandals not found." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    // Filter mandals that are not already in the user's accessibleMandals
    const newMandals = mandalIds.filter(
        (mandalId) => !user.accessibleMandals.includes(mandalId),
    );

    if (newMandals.length > 0) {
        user.accessibleMandals.push(...newMandals);
        await user.save();
    }

    return res.status(200).json({
        message: "Mandals added to accessible mandals.",
        user: await user.populate("accessibleMandals", "mandalName initials"),
    });
});

/**
 * Remove Multiple Mandals from Accessible Mandals for a User
 * @route PUT /api/users/:userId/accessible-mandals/remove
 * @access Admin
 */
const removeMandalFromAccessibleMandals = asyncHandler(async (req, res) => {
    const { userId } = req.body; // Extract userId from the URL
    const { mandalIds } = req.body; // Array of Mandal IDs to be removed

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format." });
    }

    // Validate mandalIds (ensure it's an array of ObjectIds)
    if (
        !Array.isArray(mandalIds) ||
        mandalIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
        return res
            .status(400)
            .json({ message: "Invalid Mandal ID format(s)." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    // Ensure all mandals exist in the user's accessibleMandals
    const mandalsToRemove = mandalIds.filter((mandalId) =>
        user.accessibleMandals.includes(mandalId),
    );

    if (mandalsToRemove.length === 0) {
        return res.status(404).json({
            message:
                "None of the mandals are found in user's accessible mandals.",
        });
    }

    // Update the user's accessibleMandals using MongoDB pull
    await User.findByIdAndUpdate(
        userId,
        { $pull: { accessibleMandals: { $in: mandalsToRemove } } },
        { new: true },
    );
    await user.save();

    return res.status(200).json({
        message: "Mandals removed from accessible mandals.",
        user: await user.populate("accessibleMandals", "mandalName initials"),
    });
});

/**
 * Get All Accessible Mandals by User ID
 * @route GET /api/users/:userId/accessible-mandals
 * @access Private (Admin or User itself)
 */
const getAccessibleMandalsByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.body; // Get userId from request parameters

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format." });
    }

    // Find the user by userId and populate accessibleMandals
    const user = await User.findById(userId).populate(
        "accessibleMandals",
        "mandalName initials",
    );

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    // Return the accessible mandals for the user
    return res.status(200).json({
        message: "Accessible mandals retrieved successfully.",
        accessibleMandals: user.accessibleMandals,
    });
});

module.exports = {
    registerUser,
    loginUser,
    updatePassword,
    addMandalToAccessibleMandals,
    removeMandalFromAccessibleMandals,
    getAccessibleMandalsByUserId,
    getAllUsers
};
