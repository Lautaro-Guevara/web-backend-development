// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const managementValidate = require("../utilities/management-validation")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build vehicle detail view
router.get("/detail/:invId", invController.buildByInvId)

// Route to build management view
router.get("/management/", invController.buildManagement)

// Route to build add Classification page
router.get("/add-classification", invController.buildAddClassification)

// Route to build add Vehicle page
router.get("/add-vehicle", invController.buildAddVehicle) // TODO create the controller function

// Post route to add classification
router.post(
    "/add-classification",
    managementValidate.classificationRules(),
    managementValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Route to add new vehicle
router.post(
    "/add-inventory",
    managementValidate.addVehicleRules(), // TODO create the validation rules
    managementValidate.checkAddVehicleData,  // TODO create the data check function
    utilities.handleErrors(invController.addVehicle) // TODO create the controller function
)

module.exports = router