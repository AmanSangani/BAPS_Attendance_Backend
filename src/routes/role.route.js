const { Router } = require("express");
const {
    createRole,
    assignRole,
    addPermissionsToRole,
    removePermissionsFromRole,
    getPermissionsForRole
} = require("../controllers/role.controller");
const { verifyJwt } = require("../middlewares/authMiddleware");

const router = Router();

router.route("/add").post(verifyJwt, createRole);

router.route("/assign").post(verifyJwt, assignRole);

router.route("/addPermission").post(verifyJwt, addPermissionsToRole);

router.route("/removePermission").post(verifyJwt, removePermissionsFromRole);

router.route("/getPermissionsForRole").post(verifyJwt, getPermissionsForRole);


module.exports = router;
