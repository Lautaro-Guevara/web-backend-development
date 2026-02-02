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
    return error.message
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

module.exports = { registerAccount, checkExistingEmail, checkPassword, getAccountByEmail }