const Role = require("../models/role.model"); // Role model
const { ApiResponse } = require("../utils/ApiResponse.js");


const roleAuthorization = (requiredPermissions) => {  
  return async (req, res, next) => {
    try {
      const userRole = req.user.role; // Assuming `req.user` is populated by verifyJwt
      const role = await Role.findById(userRole); // Fetch the role from DB
      
      if (!role) {
        return res
        .status(403)
        .json(
            new ApiResponse(403, [], "Role not found"),
        );
      }

      // Check if the role has all required permissions
      const hasPermissions = requiredPermissions.every((perm) =>{
        return role.permissions.includes(perm)
    });
      
      if (!hasPermissions) {
        return res.status(403).json(new ApiResponse(403, [], "Access denied."));
      }

      next(); // Proceed if authorized
    } catch (error) {
      return res.status(500).json(new ApiResponse(403, [], "Authorization error"));
    }
  };
};

module.exports = { roleAuthorization };
