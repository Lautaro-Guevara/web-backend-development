const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    console.log("Function: checkExistingEmail --- Email Found:", email.rowCount)
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

// Take informattion of account
async function getAccountByEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const account = await pool.query(sql, [account_email])
    return account.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }}

// Check if password is correct for the given email
async function checkPassword(account_email){
  try {
    const sql = "SELECT account_password FROM account WHERE account_email = $1"
    const passwordResult = await pool.query(sql, [account_email])
    return passwordResult.rows[0].account_password
  } catch (error) {
    return error.message
  }
}

// Get account information by account ID
async function getAccountById(account_id){
  try {
    const sql = "SELECT * FROM account WHERE account_id = $1"
    const account = await pool.query(sql, [account_id])
    return account.rows[0]
  } catch (error) {
    return new Error("No matching account ID found")
  }
}

// Edit account information - POST
async function editInfo(account_id, account_firstname, account_lastname, account_email){
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const updatedAccount = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return updatedAccount.rows[0]
  }
  catch (error) {
    return error.message
  }
}

// Edit Password - POST
async function editPassword(account_id, account_password){
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const updatedAccount = await pool.query(sql, [account_password, account_id])
    return updatedAccount.rows[0]
  }
  catch (error) {
    return error.message
  }
}

//-------------------------------------------------------------
// Get all employees by employee_id
//-----------------------------------------------
async function getEmployeesById(){
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname FROM account WHERE account_type = 'Employee'"
    const employees = await pool.query(sql)
    return employees.rows
  } catch (error) {
    return error.message
  }
}

module.exports = { registerAccount, checkExistingEmail, checkPassword, getAccountByEmail, getAccountById, editInfo, editPassword, getEmployeesById }