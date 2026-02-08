// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))

router.get("/edit-info/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildEditInfo))

// Post method for registration
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin) 
)

// Edit account information
router.post(
  "/edit-info",
  regValidate.editInfoRules(),
  regValidate.checkEditInfoData,
  utilities.handleErrors(accountController.editInfo)
)

// Edit account password
router.post(
  "/edit-password",
  regValidate.editPasswordRules(),
  regValidate.checkEditPasswordData,
  utilities.handleErrors(accountController.editPassword)
)

// Logout route - GET
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

module.exports = router