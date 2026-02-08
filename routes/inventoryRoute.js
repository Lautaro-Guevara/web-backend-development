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

// Route to build management view - Requires admin or employee login
router.get("/management/", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildManagement))

// Route to build add Classification page - Requires admin or employee login
router.get("/add-classification", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildAddClassification))

// Route to build add Vehicle page - Requires admin or employee login
router.get("/add-vehicle", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildAddVehicle)) 

// Route to get inventory items based on classificationId and return as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build edit vehicle page - Requires admin or employee login
router.get("/edit/:inv_id", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildEditInventory))

router.get("/delete/:inv_id", utilities.checkAdminEmployee, utilities.handleErrors(invController.buildDeleteInventory))

// Post route to add classification - Requires admin or employee login
router.post(
    "/add-classification",
    managementValidate.classificationRules(),
    managementValidate.checkClassificationData,
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.addClassification)
)

// Route to add new vehicle to inventory - Requires admin or employee login
router.post(
    "/add-inventory",
    managementValidate.addVehicleRules(), 
    managementValidate.checkAddVehicleData,  
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.addVehicle) 
)

// Route to update vehicle information - Requires admin or employee login
router.post(
    "/edit-inventory",
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.editInventory)
)

// Route to delete vehicle from inventory - Requires admin or employee login
router.post(
    "/delete-inventory",
    utilities.checkAdminEmployee,
    utilities.handleErrors(invController.deleteInventory)
)

module.exports = router