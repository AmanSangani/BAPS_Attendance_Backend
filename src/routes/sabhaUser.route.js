const { Router } = require("express");
const {
    addUser,
    getUsers,
    bulkAdd,
} = require("../controllers/sabhaUser.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");

const router = Router();

router.route("/add").post(verifyJwt, addUser);
router.route("/").post(verifyJwt, getUsers);

// -------------------------Add Many-------------------------
// Bulk Add Sabha Users
router.route("/bulkAdd").post(verifyJwt, bulkAdd);

module.exports = router;
