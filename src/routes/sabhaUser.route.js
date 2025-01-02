const { Router } = require("express");
const { addUser, getUsers } = require("../controllers/sabhaUser.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");
const { roleAuthorization } = require("../middlewares/roleMiddleware");

const router = Router();

router.route("/add").post(verifyJwt, addUser);
router.route("/").post(verifyJwt, getUsers);

module.exports = router;
