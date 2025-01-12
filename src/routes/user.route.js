const { Router } = require("express");
const {
    registerUser,
    loginUser,
    updatePassword
} = require("../controllers/user.controller.js");

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/update-password").post(updatePassword);

module.exports = router;
