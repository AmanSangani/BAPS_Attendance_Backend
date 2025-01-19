const mongoose = require("mongoose");
const Role = require("../models/role.model"); // Role model
const { User } = require("../models/user.model"); // Role model

const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const role = new Role({ name, permissions });
        await role.save();
        res.status(201).json({ message: "Role created successfully.", role });
    } catch (error) {
        res.status(500).json({ message: "Error creating role.", error });
    }
};

const assignRole = async (req, res) => {
    try {
        const { userId, roleId } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found." });

        user.role = roleId;
        await user.save();

        res.status(200).json({
            message: "Role assigned to user successfully.",
            user,
        });
    } catch (error) {
        res.status(500).json({ message: "Error assigning role.", error });
    }
};

// Add permissions to a role
const addPermissionsToRole = async (req, res) => {
    try {
        const { roleId, permissions } = req.body;

        // Validate input
        if (!roleId || !Array.isArray(permissions)) {
            return res.status(400).json({ message: "Invalid request data." });
        }

        // Find and update the role
        const role = await Role.findByIdAndUpdate(
            roleId,
            { $addToSet: { permissions: { $each: permissions } } }, // Use $addToSet to avoid duplicates
            { new: true },
        );

        if (!role) {
            return res.status(404).json({ message: "Role not found." });
        }

        res.status(200).json({
            message: "Permissions added successfully.",
            role,
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding permissions.", error });
    }
};

// Remove permissions from a role
const removePermissionsFromRole = async (req, res) => {
    try {
        const { roleId, permissions } = req.body;

        // Validate input
        if (!roleId || !Array.isArray(permissions)) {
            return res.status(400).json({ message: "Invalid request data." });
        }

        // Find and update the role
        const role = await Role.findByIdAndUpdate(
            roleId,
            { $pull: { permissions: { $in: permissions } } }, // Use $pull to remove specified permissions
            { new: true },
        );

        if (!role) {
            return res.status(404).json({ message: "Role not found." });
        }

        res.status(200).json({
            message: "Permissions removed successfully.",
            role,
        });
    } catch (error) {
        res.status(500).json({ message: "Error removing permissions.", error });
    }
};

// Get all permissions for a specific role
const getPermissionsForRole = async (req, res) => {
    try {
        const { roleId } = req.body; // Extract roleId from request parameters

        // Validate input
        if (!roleId) {
            return res.status(400).json({ message: "Role ID is required." });
        }

        // Find the role by ID
        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({ message: "Role not found." });
        }

        res.status(200).json({
            message: "Permissions retrieved successfully.",
            role: role.name,
            permissions: role.permissions,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving permissions.",
            error,
        });
    }
};

module.exports = {
    createRole,
    assignRole,
    addPermissionsToRole,
    removePermissionsFromRole,
    getPermissionsForRole,
};
