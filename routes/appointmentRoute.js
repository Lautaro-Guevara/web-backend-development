const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const appointmentController = require("../controllers/appointmentController")
const appointmentValidation = require("../utilities/appointment-validation")


//***********************
// GET
//************************

//---------------------------------------
// Deliver appointment scheduling view - Client Type Account Only
//---------------------------------------
router.get("/schedule", utilities.checkLogin, utilities.handleErrors(appointmentController.buildSchedule))

//----------------------------------------
// Get available time slots for selected employee and date
//----------------------------------------
router.get("/available-times", utilities.checkLogin, utilities.handleErrors(appointmentController.getAvailableTimes))

//----------------------------------------
// Deliver appointment cancellation confirmation view - Client Type Account Only
//---------------------------------------
router.get("/cancel/:appointment_id", utilities.checkLogin, utilities.handleErrors(appointmentController.buildCancel))



//***********************
// POST
//************************
router.post("/schedule",
    utilities.checkLogin,
    appointmentValidation.appointmentValidation(),
    appointmentValidation.checkAppointmentValidation,
    utilities.handleErrors(appointmentController.processSchedule)
)

//------------------------------
// Cancel an appointment - Client Type Account Only
//------------------------------
router.post("/cancel/:appointment_id", utilities.checkLogin, utilities.handleErrors(appointmentController.processCancel))

module.exports = router