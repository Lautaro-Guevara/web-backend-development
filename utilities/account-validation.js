const utilities =require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */

validate.registationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the DB
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
            }
        }),

        // password is required and must be strong password
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let loginLink = await utilities.buildLoginLink(req, res)
        res.render("account/register", {
            errors,
            loginLink,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

// Login validation rules
validate.loginRules = () => {
    console.log("Function: loginRules --- Executed")
    return[
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (!emailExists){
            throw new Error("Email or password is incorrect. Please try again.")
            }
        }),
        
        body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password is required.")
        .custom(async (account_password, { req }) => {
            const account_email = req.body.account_email
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (!emailExists) {
                return true
            }
            const storedPassword = await accountModel.checkPassword(account_email)
            const passwordIsValid = await utilities.comparePassword(account_password, storedPassword)
            if (!passwordIsValid){
                throw new Error("Email or password is incorrect. Please try again.")
            }
        })
    ]
    
}

validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let loginLink = await utilities.buildLoginLink(req, res)
        res.render("account/login", {
            errors,
            loginLink,
            title: "Login",
            nav,
            account_email
        })
        return
    }
    next()
}

// Validation rules for edit account information
validate.editInfoRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the DB but can be the same as the current email
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email, { req }) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            const currentEmail = req.body.account_email
            console.log("Function: editInfoRules --- Email Exists:", emailExists, "Current Email:", currentEmail)
            console.log("Emails are the same:", account_email === currentEmail)
            if (emailExists && account_email !== currentEmail){
            throw new Error("Email exists. Please log in or use different email")
            }
        })

    ]
}

// Check edit account information data and return errors or continue to update account information
validate.checkEditInfoData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let loginLink = await utilities.buildLoginLink(req, res)
        res.render("account/edit-info", {
            errors,
            loginLink,
            title: "Edit Account Information",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id: req.body.account_id
        })
        return
    }
    next()
}

// Validation for change password
validate.editPasswordRules = () => {
    return [
        // password is required, must be strong password and cannot be the same as the current password 
        body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password is required.")
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements.")
        .custom((account_password, { req }) => {
            const confirmPassword = req.body.account_password_confirm
            if (account_password !== confirmPassword) {
                throw new Error("Passwords do not match.")
            }
            return true
        })
        .custom(async (account_password, { req }) => {
            const account_id = req.body.account_id
            const accountData = await accountModel.getAccountById(account_id)
            const passwordIsSame = await utilities.comparePassword(account_password, accountData.account_password)
            if (passwordIsSame) {
                throw new Error("New password cannot be the same as the current password.")
            }
            return true
        })
        
    ]
}

// Check change password data and return errors or continue to update password
validate.checkEditPasswordData = async (req, res, next) => {
    const { account_password } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let loginLink = await utilities.buildLoginLink(req, res)
        res.render("account/edit-info", {
            errors,
            loginLink,
            title: "Edit Account Information",
            nav,
            account_password
        })
        return
    }
    next()
}

module.exports = validate