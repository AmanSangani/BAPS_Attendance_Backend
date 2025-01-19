const { Router } = require("express");
const {
    getAttendance,
    toggleAttendance,
} = require("../controllers/attendance.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");
const { roleAuthorization } = require("../middlewares/roleMiddleware");

const router = Router();

router.route("/").post(
    verifyJwt, // JWT authentication
    roleAuthorization(["view_attendance"]), // Dynamic permissions
    getAttendance,
);

router.route("/toggle").post(
    verifyJwt,
    roleAuthorization(["toggle_attendance"]), // Dynamic permissions
    toggleAttendance,
);

module.exports = router;
