const e = require("express")
const invModel = require("../models/inventory-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ***************************
 *  Constructs the navigation HTML unordered list
 * ************************** */
Util.getNav = async function(req, res, next){
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    if (data && data.length > 0) {
        data.forEach((row) => {
            list += "<li>"
            list +=
                '<a href="/inv/type/' +
                row.classification_id +
                '" title="See our inventory of ' +
                row.classification_name +
                ' vehicles">' +
                row.classification_name +
                "</a>"
            list += "</li>"
        });
    }
    list += "</ul>"
    return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */

Util.buildClassificationGrid = async function (data){
    let grid
    if (data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li class="inv-item">'
            grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
            + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
            + 'details"><img src="' + vehicle.inv_thumbnail 
            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
            +' on CSE Motors" class="vehicle-thumbnail" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$' 
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
} else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
}
    return grid
}

/* **************************************
* Build the detail view HTML
* ************************************ */

Util.buildVehicleDetail = async function (data){
    let detailView
    if (data && data.length > 0){
        let vehicle = data[0]
        detailView = '<div id="detail-view">'
        detailView += '<div id="detail-image">'
        detailView += '<img src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" id="vehicle-detail-image" />'
        detailView += '</div>'
        detailView += '<div id="detail-info">'
        detailView += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' Details: </h2>'
        detailView += '<hr />'
        detailView += '<ul id="detail-specs">'
        detailView += '<li><strong>Price: </strong>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</li>'
        detailView += '<li><strong>Description: </strong><span class="detail-description">' + vehicle.inv_description + '</span></li>'
        detailView += '<li><strong>Color: </strong>' + vehicle.inv_color + '</li>'
        detailView += '<li><strong>Mileage: </strong>' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + ' miles</li>'
        detailView += '</ul>'
        detailView += '</div>'
        detailView += '</div>'
    }else {
        detailView = '<p class="notice">Sorry, no vehicle details could be found.</p>'
    }
    return detailView
}


//---------------------
// Create Set of Options for Drop-down Menu (Classification) - Form add-inventory.ejs
//---------------------
Util.buildClassificationSelect = async function (){
    try{
        let data = await invModel.getClassifications()
    let options = '<option value="" disabled selected>Select a Classification</option>'
    data.forEach(classification => {
        options += '<option value="' + classification.classification_id + '">'
        options += classification.classification_name + '</option>'
    })
    
    return options
    } catch (error){
        console.error("Error building classification options: " + error)
    }
    
}

// Compare password helper
Util.comparePassword = async function (plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
        return false
    }else {
        return await bcrypt.compare(plainPassword, hashedPassword)
    }
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt){
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData){
                if(err){
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else{
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin){
        next()
    } else {
        req.flash("notice","Please log in.")
        return res.redirect("/account/login")
    }
}

module.exports = Util