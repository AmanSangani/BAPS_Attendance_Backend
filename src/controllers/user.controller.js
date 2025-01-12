const { ApiError } = require("../utils/ApiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { User } = require("../models/user.model.js");
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
        return res.status(400).json({ message: "Username and password are required" });
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

module.exports = { registerUser, loginUser, updatePassword };
