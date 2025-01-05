const { Router } = require("express");
const {
    getAllZones,
    getZoneById,
    insertZone,
    updateZone,
    deleteZone,
} = require("../controllers/zone.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");

const router = Router();

// Routes for managing Zones
router.route("/").get(verifyJwt, getAllZones); // Get all zones
router.route("/:id").get(verifyJwt, getZoneById); // Get zone by ID
router.route("/").post(verifyJwt, insertZone); // Insert a new zone
router.route("/:id").put(verifyJwt, updateZone); // Update zone by ID
router.route("/:id").delete(verifyJwt, deleteZone); // Delete zone by ID

module.exports = router;
