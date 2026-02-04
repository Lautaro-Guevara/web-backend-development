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
        const classificationSelect = await utilities.buildClassificationSelect()
        res.render("./inventory/management", {
            title: "Inventory Management",
            nav,
            classificationSelect,
            errors: null,
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
        const{ classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

        console.log("addVehicle controller function -- Make: " + inv_make)

        const addResult = await invModel.addVehicle({
            classification_id,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
    return res.json(invData)
    } else {
    next(new Error("No data returned"))
    }
}

//----------------------
// Build Edit Inventory View
//----------------------
invCont.buildEditInventory = async function(req, res, next){
    try{
        const inventory_id = parseInt(req.params.inv_id)
        console.log("buildEditInventory -- Inventory ID: " + inventory_id)
        let nav = await utilities.getNav()
        const itemData = await invModel.getInventoryByInvId(inventory_id)
        const classificationSelect = await utilities.
        buildClassificationSelect() 

        const itemName = itemData[0].inv_make + " " + itemData[0].inv_model


        res.render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect,
            errors: null,
            inv_id: itemData[0].inv_id,
            classification_id: itemData[0].classification_id,
            inv_make: itemData[0].inv_make,
            inv_model: itemData[0].inv_model,
            inv_year: itemData[0].inv_year,
            inv_description: itemData[0].inv_description,
            inv_image: itemData[0].inv_image,
            inv_thumbnail: itemData[0].inv_thumbnail,
            inv_price: itemData[0].inv_price,
            inv_miles: itemData[0].inv_miles,
            inv_color: itemData[0].inv_color,
        })
    } catch(error){
        next(error)
    }
}

//----------------------
// Post - Update  - Inventory
//----------------------
invCont.editInventory = async function(req, res, next){
    try{
        const{ inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

        console.log("editInventory controller function -- Make: " + inv_make)

        const updateResult = await invModel.editInventory({
            inv_id,
            classification_id,
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
        if (updateResult) {
            const itemName = updateResult.inv_make + " " + updateResult.inv_model
            req.flash("notice", `The ${itemName} was successfully updated.`)
            res.redirect("/inv/management")
        } else {
            const classificationSelect = await utilities.buildClassificationList(classification_id)
            const itemName = `${inv_make} ${inv_model}`
            req.flash("notice", "Sorry, the insert failed.")
            res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
            })
        }
    } catch(error){
        next(error)
    }
}


module.exports = invCont
