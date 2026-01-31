const { Router } = require("express");
const {
    getAttendance,
    toggleAttendance,
    getAttendanceForyuvaRaviSabha,
    toggleAttendanceYuvaRaviSabha,
    getAttendanceForYST,
    toggleAttendanceForYST,
    getMonthlyAttendanceReport,
    getMonthlyAttendanceReportYST,
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

router.route("/YST").post(
    verifyJwt,
    roleAuthorization(["toggle_attendance"]),
    getAttendanceForYST,
);

router.route("/toggleYST").post(
    verifyJwt,
    roleAuthorization(["toggle_attendance"]),
    toggleAttendanceForYST,
);

router.route("/monthly-report").get(getMonthlyAttendanceReport);
router.route("/monthly-report-yst").get(getMonthlyAttendanceReportYST);

module.exports = router;
