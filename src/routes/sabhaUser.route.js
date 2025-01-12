const { Router } = require("express");
const {
    addUser,
    getUsers,
    bulkAdd,
    bulkUpdate,
    updateUser,
    getSabhaUserByCustomID
} = require("../controllers/sabhaUser.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");

const router = Router();

router.route("/add").post(verifyJwt, addUser);
router.route("/").post(verifyJwt, getUsers);
router.route("/:customID").get(verifyJwt, getSabhaUserByCustomID);
router.route("/bulkAdd").post(verifyJwt, bulkAdd);
router.route("/update").post(verifyJwt, updateUser);
router.route("/bulkUpdate").post(verifyJwt, bulkUpdate);

module.exports = router;
