const { Designation } = require("../models/designation.model.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const { ApiError } = require("../utils/ApiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

// @desc Create a new designation
// @route POST /api/designations
// @access Private
const createDesignation = asyncHandler(async (req, res) => {
    const { designationName } = req.body;
    // Check if designation already exists
    // const existingDesignation = await Designation.findOne({ designationName });
    // if (existingDesignation) {
    //     throw new ApiError(400, "Designation already exists");
    // }

    const newDesignation = await Designation.create({ designationName, createdBy: req.user._id, });
    console.log(newDesignation);
    
    res.status(201).json(new ApiResponse(201, newDesignation, "Designation created successfully"));
});

// @desc Get all designations
// @route GET /api/designations
// @access Private
const getAllDesignations = asyncHandler(async (req, res) => {
    const designations = await Designation.find().populate("createdBy", "name email");
    res.status(200).json(new ApiResponse(200, designations, "All designations fetched successfully"));
});

// @desc Get designation by ID
// @route GET /api/designations/:id
// @access Private
const getDesignationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // const designation = await Designation.findById(id).populate("createdBy", "name email");

    // if (!designation) {
    //     throw new ApiError(404, "Designation not found");
    // }

    res.status(200).json(new ApiResponse(200, "Designation fetched successfully"));
});

// @desc Update designation
// @route PUT /api/designations/:id
// @access Private
const updateDesignation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { designationName } = req.body;

    const designation = await Designation.findById(id);
    if (!designation) {
        throw new ApiError(404, "Designation not found");
    }

    designation.designationName = designationName || designation.designationName;
    designation.createdBy= req.user._id;
    designation.modifiedAt = Date.now();
    await designation.save();

    res.status(200).json(new ApiResponse(200, designation, "Designation updated successfully"));
});

// @desc Delete designation
// @route DELETE /api/designations/:id
// @access Private
const deleteDesignation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const designation = await Designation.findById(id);

    if (!designation) {
        throw new ApiError(404, "Designation not found");
    }

    await designation.deleteOne();
    res.status(200).json(new ApiResponse(200, null, "Designation deleted successfully"));
});

// @desc Get all Designation Primary Keys
// @route GET /api/designations/pk/select
// @access Private
const getDesignationPK = asyncHandler(async (req, res) => {
    const designations = await Designation.find().select("_id designationName");
    res.status(200).json(new ApiResponse(200, designations, "Primary keys fetched successfully"));
});

module.exports = {
    createDesignation,
    getAllDesignations,
    getDesignationById,
    updateDesignation,
    deleteDesignation,
    getDesignationPK,
};
