const appointmentModel = require("../models/appointment-model")
const utilities = require("../utilities/")

require("dotenv").config()


/*******************************
 *  BUILD FUNCTIONS - GET
 *******************************/

//----------------------------------------
//  Deliver appointment scheduling view
//----------------------------------------

async function buildSchedule(req, res, next) {
    try{
        let nav = await utilities.getNav()
        let loginLink = await utilities.buildLoginLink(req, res)
        let employeeSelect = await utilities.buildEmployeeSelect()
        // No inicializar timeSelect aquí - se cargará dinámicamente con JavaScript
        let timeSelect = '<option value="">Select a date and representative first</option>'
        res.render("appointments/schedule", {
            title: "Schedule an Appointment",
            nav,
            loginLink,
            employeeSelect,
            errors: null,
            timeSelect
        })
    }catch(error){
        next(error)
    }
}

//----------------------------------------
//  Deliver appointment cancellation confirmation view
//----------------------------------------
async function buildCancel(req, res, next) {
    try{
        let nav = await utilities.getNav()
        let loginLink = await utilities.buildLoginLink(req, res)
        const appointment_id = req.params.appointment_id
        const appointment = await appointmentModel.getAppointmentById(appointment_id)

        if(!appointment){
            req.flash("notice", "Sorry, we couldn't find that appointment.")
            return res.redirect("/appointments")
        }

        res.render("appointments/cancel", {
            title: "Cancel Appointment",
            nav,
            loginLink,
            appointment,
            errors: null
        })
    }catch(error){
        next(error)
    }
}

/*******************************
 *  ACTION FUNCTIONS - POST
 *******************************/

//----------------------------------------
//  Process appointment scheduling form
//----------------------------------------
async function processSchedule(req, res, next) {
    try{
        let nav = await utilities.getNav()
        let loginLink = await utilities.buildLoginLink(req, res)
        let employeeSelect = await utilities.buildEmployeeSelect()
        // No inicializar timeSelect aquí - se cargará dinámicamente con JavaScript
        let timeSelect = '<option value="">Select a date and representative first</option>'

        const { employee_account_id, appointment_date, appointment_time, appointment_reason, client_account_id } = req.body

        console.log("Appointment Date:", appointment_date, "Time:", appointment_time)
        const result = await appointmentModel.createAppointment(appointment_date, appointment_time, appointment_reason, client_account_id, employee_account_id)

        if(result){
            req.flash("notice", "Your appointment has been scheduled successfully!")
            return res.redirect("/account")
        }
        else{
            req.flash("notice", "Sorry, there was an error scheduling your appointment. Please try again.")
            return res.render("appointments/schedule", {
                title: "Schedule an Appointment",
                nav,
                loginLink,
                employeeSelect,
                timeSelect,
                errors: null
            })
        }
        
    }catch(error){
        next(error)
    }
}

//------------------------------------------------
//  Check if appointment date expires after the date and time of the appointment and delete if it does
//----------------------------------------
async function checkExpiredAppointments(req, res, next) {
    try{
        const result = await appointmentModel.deleteExpiredAppointments()
        next()
    }catch(error){
        next(error)
    }
}

//----------------------------------------
//  Process appointment cancellation
//----------------------------------------
async function processCancel(req, res, next) {
    try{
        const appointment_id = req.params.appointment_id
        const result = await appointmentModel.deleteAppointmentById(appointment_id)
        if(result){
            req.flash("info", "Your appointment has been cancelled.")
        }
        else{
            req.flash("notice", "Sorry, there was an error cancelling your appointment. Please try again.")
        }
        return res.redirect("/account")
    }catch(error){
        next(error)
    }
}

//------------------------------
//  Middleware
//------------------------------

//-------------------------------
//  Check if an the time for the appointment is not superposed with another appointment for the same employee
//-------------------------------
async function checkAppointmentConflict(req, res, next) {
    const { employee_account_id, appointment_date, appointment_time } = req.body
    try {
        const conflict = await appointmentModel.checkAppointmentConflict(employee_account_id, appointment_date, appointment_time)
        if (conflict) {
            let nav = await utilities.getNav()
            let loginLink = await utilities.buildLoginLink(req, res)
            let employeeSelect = await utilities.buildEmployeeSelect()
            return res.render("appointments/schedule", {
                title: "Schedule an Appointment",
                nav,
                loginLink,
                employeeSelect,
                errors: [{ msg: "Sorry, this employee is not available at the selected time. Please choose a different time." }]
            })
        }
        next()
    } catch (error) {
        next(error)
    }
}

//----------------------------------------
//  Get available time slots for employee and date
//----------------------------------------
async function getAvailableTimes(req, res, next) {
    try {
        const { employee_account_id, appointment_date } = req.query
        
        if (!employee_account_id || !appointment_date) {
            return res.json({ success: false, message: "Missing required parameters" })
        }
        
        // Generar opciones de horario usando la función de utilidades
        const options = await utilities.buildTimeSelect(employee_account_id, appointment_date)
        
        if (options.includes('<option value="">')) {
            // Si no hay opciones disponibles (solo tiene la opción por defecto)
            const hasOptions = options.split('</option>').length > 2
            res.json({ success: hasOptions, options })
        } else {
            res.json({ success: true, options })
        }
    } catch (error) {
        console.error("Error getting available times:", error)
        res.json({ success: false, message: "Error loading available times" })
    }
}

module.exports = { buildSchedule, processSchedule, checkExpiredAppointments, buildCancel, processCancel, checkAppointmentConflict, getAvailableTimes }