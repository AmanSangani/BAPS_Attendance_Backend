const asyncHandler = require("express-async-handler");
const { Zone } = require("../models/zone.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");



/**
 * Get All Zones
 * @route GET /api/zones
 * @access Private
 */
const getAllZones = asyncHandler(async (req, res) => {
    const zones = await Zone.find()
        .select("_id zoneName city") // Select relevant fields
        .sort({ createdAt: -1 }); // Sort by creation date

    return res.status(200).json(new ApiResponse(200, zones, "Zones retrieved successfully."));
});



/**
 * Get Zone by Primary Key (ID)
 * @route GET /api/zone/:id
 * @access Private
 */
const getZoneById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find zone by ID
    const zone = await Zone.findById(id).populate("createdBy", "name email"); // Populate creator info

    if (!zone) {
        throw new ApiError(404, "Zone not found.");
    }

    return res.status(200).json(new ApiResponse(200, zone, "Zone retrieved successfully."));
});



/**
 * Insert a New Zone
 * @route POST /api/zone
 * @access Private
 */
const insertZone = asyncHandler(async (req, res) => {
    const { zoneName, city } = req.body;

    // Validate input
    if (!zoneName || !city) {
        throw new ApiError(400, "All fields (zoneName, city) are required.");
    }

    // Check if zone with the same name already exists
    const existingZone = await Zone.findOne({ zoneName });
    if (existingZone) {
        throw new ApiError(409, "Zone with the same name already exists.");
    }

    // Create new zone
    const newZone = await Zone.create({
        zoneName,
        city,
        createdBy: req.user._id, // Set the logged-in user as creator
    });

    return res.status(201).json(new ApiResponse(201, newZone, "Zone created successfully."));
});



/**
 * Update Zone by ID
 * @route PUT /api/zone/:id
 * @access Private
 */
const updateZone = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { zoneName, city } = req.body;

    // Validate input
    if (!zoneName || !city) {
        throw new ApiError(400, "All fields (zoneName, city) are required.");
    }

    // Check if zone exists
    const zone = await Zone.findById(id);
    if (!zone) {
        throw new ApiError(404, "Zone not found.");
    }

    // Check if zoneName is already taken (excluding current zone)
    const existingZone = await Zone.findOne({
        zoneName,
        _id: { $ne: id }, // Exclude the current zone
    });
    if (existingZone) {
        throw new ApiError(409, "Zone with the same name already exists.");
    }

    // Update the zone
    zone.zoneName = zoneName;
    zone.city = city;

    await zone.save();

    return res.status(200).json(new ApiResponse(200, zone, "Zone updated successfully."));
});



/**
 * Delete Zone by ID
 * @route DELETE /api/zone/:id
 * @access Private
 */
const deleteZone = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find zone by ID
    const zone = await Zone.findById(id);
    if (!zone) {
        throw new ApiError(404, "Zone not found.");
    }

    // Delete the zone
    await zone.remove();

    return res.status(200).json(new ApiResponse(200, null, "Zone deleted successfully."));
});



module.exports = {
    getAllZones,
    getZoneById,
    insertZone,
    updateZone,
    deleteZone,
};
