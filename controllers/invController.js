const invModel = require ("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function(req, res, next){
    try{
        const classification_id = req.params.classificationId
        const data = await invModel.getInventoryByClassificationId(classification_id)
        
        if (!data || data.length === 0) {
            const error = new Error("Classification not found")
            error.status = 404
            return next(error)
        }
        
        const grid = await utilities.buildClassificationGrid(data)
        let nav = await utilities.getNav()
        const className = data[0].classification_name
        res.render("./inventory/classification", {
            title: className + " vehicles",
            nav,
            grid,
        })
    }
    catch(error){
        next(error)
    }
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */

invCont.buildByInvId = async function(req, res, next){
    try{
        const inv_id = req.params.invId
        const data = await invModel.getInventoryByInvId(inv_id)
        
        if (!data || data.length === 0) {
            const error = new Error("Vehicle not found")
            error.status = 404
            return next(error)
        }
        
        const detail = await utilities.buildVehicleDetail(data)
        let nav = await utilities.getNav()
        const inv_year = data[0].inv_year
        const makeName = data[0].inv_make
        const modelName = data[0].inv_model
        

        res.render("./inventory/detail", {
            title: inv_year + " " + makeName + " " + modelName,
            nav,
            detail,
    })
    }
    catch(error){
        next(error)
    }

}

// ---------------------
// Build management view
// ---------------------
invCont.buildManagement = async function(req, res, next){
    try{
        let nav = await utilities.getNav()
        res.render("./inventory/management", {
            title: "Inventory Management",
            nav,
        })
    } catch(error){
        next(error)
    }
}

//----------------------
// Build add New Classification
//----------------------
invCont.buildAddClassification = async function(req, res, next){
    try{
        let nav = await utilities.getNav()
        res.render("./inventory/add-classification", {
            title: "Inventory Management",
            nav,
            errors: null,
        })
    } catch(error){
        next(error)
    }
}

//----------------------
// Build add New Vehicle
//----------------------
invCont.buildAddVehicle = async function(req, res, next){
    try{
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationSelect() // Build the classification select options - Done
        console.log("buildAddVehicle function -- Classification:" + classificationSelect);
        res.render("./inventory/add-inventory", {
            title: "Add Vehicle",
            nav,
            classificationSelect,
            errors: null,
        })
    } catch(error){
        next(error)
    }
}

// ---------------------
// Post New Classification
// ---------------------

invCont.addClassification = async function(req, res, next){
    try{
        const { classification_name } = req.body
        const addResult = await invModel.addClassification(classification_name)
        if (addResult) {
            req.flash("notice", `Classification ${classification_name} added successfully`)
            res.redirect("/inv/management")
        } else {
            req.flash("notice", "Failed to add classification")
            res.redirect("/inv/add-classification")
        }
    } catch(error){
        next(error)
    }
}

//----------------------
// Post New Vehicle
//----------------------
invCont.addVehicle = async function(req, res, next){
    try{
        const{ classification_name, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

        console.log("addVehicle controller function -- Make: " + inv_make)

        const addResult = await invModel.addVehicle({
            classification_name,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color
        })
        if (addResult) {
            req.flash("notice", `Vehicle added successfully`)
            res.redirect("/inv/management")
        } else {
            req.flash("notice", "Failed to add vehicle")
            res.redirect("/inv/add-inventory")
        }
    } catch(error){
        next(error)
    }
}

module.exports = invCont
