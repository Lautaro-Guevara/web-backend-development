const utilities =require(".")
const { body, validationResult } = require("express-validator")
const inventoryModel = require("../models/inventory-model")

const validate = {}


validate.classificationRules = () => {
    return[
        // classification name is required and must be string
        body("classification_name")
        .trim()
        .escape()
        .isLength({ min: 2, max: 15 })
        .isAlpha('en-US', {ignore: ' -'})
        .notEmpty()
        .withMessage("Classification name must be between 2 and 15 characters")
        .custom(async (classification_name) => {
            const classExists = await inventoryModel.checkExistingClassification(classification_name)
            if (classExists){
            throw new Error("Classification exists. Please use different classification name")
            }
        })
    ]
}

// Check data and return errors or continue to registration
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}


//----------------------
// Validation rules for adding a vehicle
//----------------------
validate.addVehicleRules = () => {
    return[

        // Classification name is required and must exist in DB
        body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please select a classification.")
        .isInt({ min: 1 })
        .withMessage("Please select a valid classification.")
        .custom(async (classification_id) => {
            const classExists = await inventoryModel.checkExistingClassificationId(classification_id)
            if (!classExists){
            throw new Error("Classification does not exist. Please select a valid classification.")
            }
        }),

        // Make is required, must be string min 3 characters
        body("inv_make")
        .trim()
        .escape()
        .isLength({ min: 3 })
        .withMessage("Make must be at least 3 characters."),

        // Model is required, must be string min 3 characters
        body("inv_model")
        .trim()
        .escape()
        .isLength({ min: 3 })
        .withMessage("Model must be at least 3 characters."),

        // Description is required, must be string min 10 characters max 500 characters
        body("inv_description")
        .trim()
        .escape()
        .isLength({ min: 10, max: 500 })
        .withMessage("Description must be between 10 and 500 characters."),

        // Image URL is required, must be valid URL
        // body("inv_image")
        // .trim()
        // .withMessage("Please provide a valid image URL."),

        // // Thumbnail URL is required, must be valid URL
        // body("inv_thumbnail")
        // .trim()
        // .withMessage("Please provide a valid thumbnail URL."),

        // Price is required, must be a valid decimal or integer number
        body("inv_price")
        .trim()
        .escape()
        .isFloat({ min: 0 })
        .withMessage("Please provide a valid price."),

        // Year is required, must be a valid year
        body("inv_year")
        .trim()
        .escape()
        .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
        .withMessage("Please provide a valid year."),

        // Mileage is required, must be a valid integer number
        body("inv_miles")
        .trim()
        .escape()
        .isInt({ min: 0 })
        .withMessage("Please provide a valid mileage."),

        // Color is required, must be string min 3 characters
        body("inv_color")
        .trim()
        .escape()
        .isLength({ min: 3 })
        .withMessage("Color must be at least 3 characters."),
    ]
}

// Check data and return errors or continue to adding vehicle
validate.checkAddVehicleData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    console.log("CheckAddVehicle --  Make: " + inv_make)
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationSelect() // Build the classification select options
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Vehicle",
            nav,
            classificationSelect,
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}


// Check data and return errors or continue to adding vehicle
validate.checkAddVehicleData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    console.log("CheckAddVehicle --  Make: " + inv_make)
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationSelect() // Build the classification select options
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Vehicle",
            nav,
            classificationSelect,
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}


// Check data and return errors or continue to updating vehicle
validate.checkUpdateVehicleData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body
    console.log("CheckUpdateVehicle --  Make: " + inv_make)
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationSelect() // Build the classification select options
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit Vehicle",
            nav,
            classificationSelect,
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            inv_id,
        })
        return
    }
    next()
}

module.exports = validate