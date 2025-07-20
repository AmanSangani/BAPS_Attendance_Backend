const { Router } = require("express");
const {
    getAttendance,
    toggleAttendance,
    getAttendanceForyuvaRaviSabha,
    toggleAttendanceYuvaRaviSabha,
    getMonthlyAttendanceReport,
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

router.route("/YuvaRaviSabha").post(
    verifyJwt,
    roleAuthorization(["toggle_attendance"]), // Dynamic permissions
    getAttendanceForyuvaRaviSabha,
);

router.route("/toggleYuvaRaviSabha").post(
    verifyJwt,
    roleAuthorization(["toggle_attendance"]), // Dynamic permissions
    toggleAttendanceYuvaRaviSabha,
);

router.route("/monthly-report").get(getMonthlyAttendanceReport);

module.exports = router;
