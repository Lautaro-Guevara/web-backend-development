const e = require("express")
const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const appointmentModel = require("../models/appointment-model")
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

//------------------------------
// Build login link depending on login status
//------------------------------
Util.buildLoginLink = async function (req, res){
    try{
    if (res.locals.loggedin){
        return '<a href="/account/" title="Account Management">Welcome Basic</a>  <a href="/account/logout" title="Logout of your account">Logout</a>'
    }
    return '<a href="/account/login" title="Login to your account">My Account</a>'
} catch (error){
    console.error("Error building login link: " + error)
    return '<a href="/account/login" title="Login to your account">My Account</a>'
}}

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

//-----------------------------
// Middleware to check if user have authorization to access admin and employee routes (same privileges) using account type from JWT token
//-----------------------------
Util.checkAdminEmployee = (req, res, next) => {
    if (res.locals.accountData && (res.locals.accountData.account_type === "Admin" || res.locals.accountData.account_type === "Employee")){
        next()
    } else {
        req.flash("notice", "You do not have permission to access this page.")
        return res.redirect("/account/login")
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

//---------------------------------------------
// Check if user is logged in
//---------------------------------------------
Util.isLoggedIn = (req, res, next) => {
    if (res.locals.loggedin){
        return true
    }
    return false
}

//---------------------------------------------
// Build content for management view
//---------------------------------------------
Util.buildManagementContent = async function (req, res){
    let content = ""
    let accountType = res.locals.accountData ? res.locals.accountData.account_type : ""
    appointmentModel.deleteExpiredAppointments()

    content += "<h2>You are logged in - Welcome " + res.locals.accountData.account_firstname + "!</h2>"
    content += "<p><a href='/account/edit-info/" + res.locals.accountData.account_id + "' title='Update Account Information'>Update Account Information</a></p>"

    if (accountType === "Client"){
        let appointments = await appointmentModel.getAppointmentsByClientId(res.locals.accountData.account_id)
        content += "<h3>Visit Us!</h3>"

        if(appointments.length === 0){
            content += "<p>You currently have no appointments scheduled. Click the link below to schedule an appointment with one of our representatives.</p>"
            content += "<p><a href='/appointments/schedule/' title='Schedule an appointment'>Schedule an appointment</a></p>"
            console.log("Appointments for client ID " + res.locals.accountData.account_id + ":", appointments)
        }
        


        if(appointments.length > 0){

            content += "<h3>Your Appointments</h3>"
            appointments.forEach(appointment => {
            const appointmentDateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            const appointmentTimeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

            const appoointmentDate = appointmentDateFormatter.format(new Date(appointment.appointment_date))
            const appointmentTime = appointmentTimeFormatter.format(new Date(`1970-01-01T${appointment.appointment_time}`))
            
            
                content += "<p>" + appoointmentDate + " at " + appointmentTime + " - with " + appointment.employee_first_name + " " + appointment.employee_last_name + " - Reason: " + appointment.appointment_reason + " | <a href='/appointments/cancel/" + appointment.appointment_id + "' title='Cancel appointment'>Cancel</a></p>"
            })
        }

        return content
    }
    

    if (accountType === "Admin" || accountType === "Employee"){
        content += "<h3>Inventory Management</h3>"
        content += "<p><a href='/inv/management/'>Inventory Management</a></p>"

        

        if (accountType === "Employee"){

            const appointments = await appointmentModel.getAppointmentsByEmployeeId(res.locals.accountData.account_id)

            if (appointments.length > 0){

                appointments.forEach(appointment => {
                const appointmentDateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                const appointmentTimeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

                const appoointmentDate = appointmentDateFormatter.format(new Date(appointment.appointment_date))
                const appointmentTime = appointmentTimeFormatter.format(new Date(`1970-01-01T${appointment.appointment_time}`))

                content += "<h3>Yours Next Appointment</h3>"
                content += "<p> " + appoointmentDate + " at " + appointmentTime + " - With " + appointment.client_first_name + " " + appointment.client_last_name + " - Reason: " + appointment.appointment_reason + " </p>"
            })
        }

        return content
    } else {
        return content
    }
}}

//---------------------------------------------
// Build Select options for employee representatives in appointment scheduling form
//---------------------------------------------
Util.buildEmployeeSelect = async function (){
    try{
        let data = await accountModel.getEmployeesById()
        let options = '<option value="" disabled selected>Select a Representative</option>'
        data.forEach(employee => {
            options += '<option value="' + employee.account_id + '">'
            options += employee.account_firstname + ' ' + employee.account_lastname + '</option>'
        })
        return options
    } catch (error) {
        console.error("Error building employee select options:", error)
        return '<option value="" disabled selected>No representatives available</option>'
    }
}

//---------------------------------
// Build Select options for time selection in appointment scheduling form - Only aveilable time slots within business hours (9:00 AM to 4:00 PM) will be shown
//---------------------------------
Util.buildTimeSelect = async function (employee_account_id, appointment_date){
    let options = '<option value="" disabled selected>Select a Time</option>'

    for (let hour = 9; hour <= 16; hour++) {
        //
        for (let minute = 0; minute < 60; minute += 30) {
            const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            const conflict = await appointmentModel.checkAppointmentConflict(employee_account_id, appointment_date, timeValue)
            if (!conflict) {
                const timeLabel = new Date(`1970-01-01T${timeValue}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                options += `<option value="${timeValue}">${timeLabel}</option>`
            }
        }
    }
    return options
}


module.exports = Util