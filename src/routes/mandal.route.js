const { Router } = require("express");
const {
    getAllMandals,
    getMandalById,
    insertMandal,
    updateMandal,
    deleteMandal,
    getMandalsByZone, // Add the new route for finding mandals by zone
} = require("../controllers/mandal.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");

const router = Router();

// Routes for managing Mandals
router.route("/").get(verifyJwt, getAllMandals); // Get all mandals
router.route("/:id").get(verifyJwt, getMandalById); // Get mandal by ID
router.route("/add").post(verifyJwt, insertMandal); // Insert a new mandal
router.route("/:id").put(verifyJwt, updateMandal); // Update mandal by ID
router.route("/:id").delete(verifyJwt, deleteMandal); // Delete mandal by ID
router.route("/zone").post(verifyJwt, getMandalsByZone); // Get mandals by zone

module.exports = router;
