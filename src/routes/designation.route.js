const { Router } = require("express");
const { 
    createDesignation, 
    getAllDesignations, 
    getDesignationById, 
    updateDesignation, 
    deleteDesignation, 
    getDesignationPK 
} = require("../controllers/designation.controller.js");

const { verifyJwt } = require("../middlewares/authMiddleware");

const router = Router();

router.route("/").post(verifyJwt, getAllDesignations); 

router.route("/pk/:id").post(verifyJwt, getDesignationById); 

router.route("/add").post(verifyJwt, createDesignation); 

router.route("/update/:id").post(verifyJwt, updateDesignation); 

router.route("/delete/:id").post(verifyJwt, deleteDesignation); 


module.exports = router;
