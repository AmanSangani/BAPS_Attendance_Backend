const { Router } = require("express");
const {
    getAttendance,
    toggleAttendance,
} = require("../controllers/attendance.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");
const { roleAuthorization } = require("../middlewares/roleMiddleware");

const router = Router();

router
    .route("/")
    .post(
        verifyJwt,
        roleAuthorization("admin", "SahSanchalak", "Sanchalak"),
        getAttendance,
    );
router
    .route("/toggle")
    .post(
        verifyJwt,
        roleAuthorization("admin", "SahSanchalak"),
        toggleAttendance,
    );

module.exports = router;
