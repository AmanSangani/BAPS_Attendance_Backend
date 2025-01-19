const Role = require("../models/role.model"); // Role model

const roleAuthorization = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role; // Assuming `req.user` is populated by verifyJwt
      const role = await Role.findById(userRole); // Fetch the role from DB

      if (!role) {
        return res.status(403).json({ message: "Role not found." });
      }

      // Check if the role has all required permissions
      const hasPermissions = requiredPermissions.every((perm) =>
        role.permissions.includes(perm)
      );

      if (!hasPermissions) {
        return res.status(403).json({ message: "Access denied." });
      }

      next(); // Proceed if authorized
    } catch (error) {
      return res.status(500).json({ message: "Authorization error.", error });
    }
  };
};

module.exports = { roleAuthorization };
