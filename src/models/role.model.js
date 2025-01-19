const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }], // Permissions as strings for simplicity
});

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
