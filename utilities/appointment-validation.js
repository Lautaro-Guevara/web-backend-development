const utilities =require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const appointmentModel = require("../models/appointment-model")

const validate = {}


// Validation rules for appointment scheduling form
validate.appointmentValidation = () => [
    body("employee_account_id")
        .notEmpty()
        .withMessage("Please select a representative to assist you.")
        .custom(async (value) => {
            const employee = await accountModel.getEmployeesById(value)
            if (!employee) {
                return Promise.reject("Selected representative does not exist.")
            }
        }),
    body("appointment_date")
        .notEmpty()
        .withMessage("Please select a date for your appointment.")
        .isISO8601()
        .withMessage("Please enter a valid date.")
        .custom((value) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0) // Set to midnight for accurate comparison
            
            const selectedDate = new Date(value)
            console.log("Selected Date:", selectedDate, "Today:", today)
            if (selectedDate <= today) {
                throw new Error("Appointment date cannot be in the past.")
            }
            return true
        }),
    body("appointment_time")
        .notEmpty()
        .withMessage("Please select a time for your appointment.")
        .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/)
        .custom(value => {
            const [hours, minutes] = value.split(":").map(Number)
            if (hours < 9 || (hours === 16 && minutes > 0) || hours > 16) {
                throw new Error("Appointment time must be within business hours (9:00 AM to 4:00 PM).")
            }
            return true
        }),
    body("appointment_reason")
        .notEmpty()
        .withMessage("Please provide a reason for your appointment.")
        .isLength({ max: 255 })
        .withMessage("Reason for appointment cannot exceed 255 characters."),
]

// Check appointment validation results
validate.checkAppointmentValidation = async (req, res, next) => {
    const { employee_account_id, appointment_date, appointment_time, appointment_reason} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let loginLink = await utilities.buildLoginLink(req, res)
        let employeeSelect = await utilities.buildEmployeeSelect()
        let timeSelect = '<option value="">Select a date and representative first</option>'
        return res.render("appointments/schedule", {
            title: "Schedule an Appointment",
            nav,
            loginLink,
            employeeSelect,
            timeSelect,
            errors,
            employee_account_id,
            appointment_date,
            appointment_time,
            appointment_reason
        })
    } else {
        next()
    }
}

module.exports = validate