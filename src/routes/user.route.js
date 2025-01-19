const { Router } = require("express");
const {
    registerUser,
    loginUser,
    updatePassword,
    addMandalToAccessibleMandals,
    removeMandalFromAccessibleMandals,
    getAccessibleMandalsByUserId,
    getAllUsers
} = require("../controllers/user.controller.js");

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/update-password").post(updatePassword);

router.route("/getAllUsers").post(getAllUsers);

router.route("/addMandalToAccessibleMandals").post(addMandalToAccessibleMandals);
router.route("/removeMandalFromAccessibleMandals").post(removeMandalFromAccessibleMandals);

router.route("/getAccessibleMandalsByUserId").post(getAccessibleMandalsByUserId);

module.exports = router;
