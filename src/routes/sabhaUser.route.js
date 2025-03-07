const { Router } = require("express");
const {
    addUser,
    getUsers,
    bulkAdd,
    bulkUpdate,
    updateUser,
    getSabhaUserByCustomID,
    deleteSabhaUser,
    getUsersForYuvaRaviSabha,
} = require("../controllers/sabhaUser.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");
const { roleAuthorization } = require("../middlewares/roleMiddleware");

const router = Router();

router.route("/add").post(verifyJwt, addUser);
router.route("/").post(verifyJwt, getUsers);
router.route("/getUsersForYuvaRaviSabha").post(verifyJwt, getUsersForYuvaRaviSabha);
router.route("/:customID").get(verifyJwt, getSabhaUserByCustomID);
router.route("/bulkAdd").post(verifyJwt, bulkAdd);
router.route("/update").post(verifyJwt, updateUser);
router.route("/bulkUpdate").post(verifyJwt, bulkUpdate);
router.route("/delete/:customID").post(verifyJwt,roleAuthorization(["delete_sabhaUser"]), deleteSabhaUser);

module.exports = router;
