const pool = require('../database/')


/* ***************************
 *  Create new appointment
 * ************************** */
async function createAppointment(app_date, app_time, app_reason, account_id, emp_id){
    try {
        const sql = "INSERT INTO appointments (appointment_date, appointment_time, appointment_reason, client_account_id, employee_account_id) VALUES ($1, $2, $3, $4, $5) RETURNING *"
        console.log("Creating appointment with date:", app_date, "time:", app_time, "reason:", app_reason, "client ID:", account_id, "employee ID:", emp_id)
        return await pool.query(sql, [app_date, app_time, app_reason, account_id, emp_id])
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Get appointments by client ID
 * ************************** */
async function getAppointmentsByClientId(client_account_id){
    try {
        const sql = "SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.appointment_reason, e.account_firstname AS employee_first_name, e.account_lastname AS employee_last_name FROM appointments a JOIN account e ON a.employee_account_id = e.account_id WHERE a.client_account_id = $1 ORDER BY a.appointment_date DESC, a.appointment_time DESC"
        const values = [client_account_id]
        const result = await pool.query(sql, values)
        return result.rows
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Get appointments by employee ID
 * ************************** */
async function getAppointmentsByEmployeeId(employee_account_id){
    try {
        const sql = "SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.appointment_reason, c.account_firstname AS client_first_name, c.account_lastname AS client_last_name FROM appointments a JOIN account c ON a.client_account_id = c.account_id WHERE a.employee_account_id = $1 ORDER BY a.appointment_date DESC, a.appointment_time DESC"
        const values = [employee_account_id]
        const result = await pool.query(sql, values)
        return result.rows
    } catch (error) {
        return error.message
    }
}

//------------------------------
//  Get appointment details by appointment ID
//------------------------------
async function getAppointmentById(appointment_id){
    try {
        const sql = "SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.appointment_reason, e.account_firstname AS employee_first_name, e.account_lastname AS employee_last_name FROM appointments a JOIN account e ON a.employee_account_id = e.account_id WHERE a.appointment_id = $1"
        const values = [appointment_id]
        const result = await pool.query(sql, values)
        return result.rows[0]
    } catch (error) {
        return error.message
    }
}


//------------------------------
// Delete expired appointments
//------------------------------
async function deleteExpiredAppointments(){
    try {
        const sql = "DELETE FROM appointments WHERE appointment_date < NOW()"
        await pool.query(sql)
        return true
    } catch (error) {
        return error.message
    }
}

//------------------------------
// Cancel an appointment by appointment ID
//------------------------------
async function deleteAppointmentById(appointment_id){
    try {
        const sql = "DELETE FROM appointments WHERE appointment_id = $1"
        const values = [appointment_id]
        await pool.query(sql, values)
        return true
    } catch (error) {
        return error.message
    }
}

//------------------------------
//  Check if date and time for the appointment is not superposed with another appointment for the same employee
//------------------------------
async function checkAppointmentConflict(employee_account_id, appointment_date, appointment_time){
    try {
        const sql = "SELECT * FROM appointments WHERE employee_account_id = $1 AND appointment_date = $2 AND appointment_time = $3"
        const values = [employee_account_id, appointment_date, appointment_time]
        const result = await pool.query(sql, values)
        return result.rows.length > 0 // Returns true if there is a conflict, false otherwise
    } catch (error) {
        return error.message
    }
}

module.exports = { createAppointment, getAppointmentsByClientId, getAppointmentsByEmployeeId, getAppointmentById, deleteExpiredAppointments, deleteAppointmentById, checkAppointmentConflict }