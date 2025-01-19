const { asyncHandler } = require("../utils/asyncHandler.js");
const { Mandal } = require("../models/mandal.model.js");
const { User } = require("../models/user.model.js");
const { Zone } = require("../models/zone.model.js");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const mongoose = require("mongoose");

/**
 * Get All Mandals
 * @route GET /api/mandals
 * @access Private
 */
const getAllMandals = asyncHandler(async (req, res) => {
    const mandals = await Mandal.find()
        .select("_id mandalName initials zone") // Select only necessary fields
        .sort({ createdAt: -1 }); // Sort by creation date

    return res
        .status(200)
        .json(new ApiResponse(200, mandals, "Mandals retrieved successfully."));
});

const getMandalsByZone = asyncHandler(async (req, res) => {
    const { zoneId } = req.body; // Extract zoneId from request body
    const userId = req.user._id; // Assuming `req.user` contains the authenticated user

    // Validate zoneId
    if (!mongoose.Types.ObjectId.isValid(zoneId)) {
        throw new ApiError(400, "Invalid Zone ID format.");
    }

    // Fetch user's accessible mandals
    const user = await User.findById(userId).populate(
        "accessibleMandals",
        "_id",
    );
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const accessibleMandalIds = user.accessibleMandals.map((mandal) =>
        mandal._id.toString(),
    );

    // Find mandals in the given zone that the user has access to
    const mandals = await Mandal.find({
        zone: zoneId,
        _id: { $in: accessibleMandalIds },
    })
        .select("_id mandalName initials")
        .populate("zone", "zoneName")
        .sort({ createdAt: -1 });

    if (mandals.length === 0) {
        throw new ApiError(404, "No mandals found for the specified zone.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                mandals,
                "Mandals retrieved by zone successfully.",
            ),
        );
});

/**
 * Get Mandal by Primary Key (ID)
 * @route GET /api/mandal/:id
 * @access Private
 */
const getMandalById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find mandal by ID
    const mandal = await Mandal.findById(id).populate(
        "zone createdBy",
        "zoneName name",
    ); // Populate with related zone and createdBy info

    if (!mandal) {
        throw new ApiError(404, "Mandal not found.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, mandal, "Mandal retrieved successfully."));
});

/**
 * Insert a New Mandal
 * @route POST /api/mandal
 * @access Private
 */
const insertMandal = asyncHandler(async (req, res) => {
    const { mandalName, initials, zone } = req.body;

    // Validate input
    if (!mandalName || !initials || !zone) {
        throw new ApiError(
            400,
            "All fields (mandalName, initials, zone) are required.",
        );
    }

    // Check if the zone exists
    const existingZone = await Zone.findById(zone);
    if (!existingZone) {
        throw new ApiError(404, "Zone not found.");
    }

    // Check if mandal with the same name or initials already exists
    const existingMandal = await Mandal.findOne({
        $or: [{ mandalName }, { initials }],
    });
    if (existingMandal) {
        throw new ApiError(
            409,
            "Mandal with the same name or initials already exists.",
        );
    }

    // Create new mandal
    const newMandal = await Mandal.create({
        mandalName,
        initials,
        zone: existingZone._id, // Ensure we use the correct zone ID
        createdBy: req.user._id, // Set the logged-in user as creator
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newMandal, "Mandal created successfully."));
});

/**
 * Update Mandal by ID
 * @route PUT /api/mandal/:id
 * @access Private
 */
const updateMandal = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { mandalName, initials, zone } = req.body;

    // Validate input
    if (!mandalName || !initials || !zone) {
        throw new ApiError(
            400,
            "All fields (mandalName, initials, zone) are required.",
        );
    }

    // Check if mandal exists
    const mandal = await Mandal.findById(id);
    if (!mandal) {
        throw new ApiError(404, "Mandal not found.");
    }

    // Check if mandalName or initials are already taken (excluding current mandal)
    const existingMandal = await Mandal.findOne({
        $or: [{ mandalName }, { initials }],
        _id: { $ne: id }, // Exclude the current mandal
    });
    if (existingMandal) {
        throw new ApiError(
            409,
            "Mandal with the same name or initials already exists.",
        );
    }

    // Update the mandal
    mandal.mandalName = mandalName;
    mandal.initials = initials;
    mandal.zone = zone;

    await mandal.save();

    return res
        .status(200)
        .json(new ApiResponse(200, mandal, "Mandal updated successfully."));
});

/**
 * Delete Mandal by ID
 * @route DELETE /api/mandal/:id
 * @access Private
 */
const deleteMandal = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find mandal by ID
    const mandal = await Mandal.findById(id);
    if (!mandal) {
        throw new ApiError(404, "Mandal not found.");
    }

    // Delete the mandal
    await mandal.remove();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Mandal deleted successfully."));
});

module.exports = {
    getAllMandals,
    getMandalsByZone,
    getMandalById,
    insertMandal,
    updateMandal,
    deleteMandal,
};
