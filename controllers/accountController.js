const accountModel = require("../models/account-model")
const utilities = require("../utilities/")

const jwt = require("jsonwebtoken")
require("dotenv").config()

const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    let loginLink = await utilities.buildLoginLink(req, res)
    res.render("account/login", {
        title: "Login",
        nav,
        loginLink,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  try{
    let nav = await utilities.getNav()
    let loginLink = await utilities.buildLoginLink(req, res)
    res.render("account/register", {
    title: "Register",
    nav,
    loginLink,
    errors: null
  })
  }catch(error){
    next(error)
  }
  
}

//---------------------------------
// Deliver account management view
//---------------------------------
async function buildAccount(req, res, next) {
  try{
    let nav = await utilities.getNav()
    let loginLink = await utilities.buildLoginLink(req, res)
    let content = await utilities.buildManagementContent(req, res)
    console.log("Function: buildAccount --- loginLink:", loginLink)
    res.render("account/account", {
    title: "Account Management",
    nav,
    loginLink,
    content,
    errors: null
  })
  }catch(error){
    next(error)
  }
}


//---------------------------------------
// Deliver edit account information view
//---------------------------------------
async function buildEditInfo(req, res, next) {
  try{
    let nav = await utilities.getNav()
    let loginLink = await utilities.buildLoginLink(req, res)
    const account_id = req.params.account_id
    const accountData = await accountModel.getAccountById(account_id)

    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }
    console.log("AccountController - buildEditInfo --- Executing")
    res.render("./account/edit-info", {
    loginLink,  
    title: "Edit Account Information",
    nav,
    accountData,
    errors: null
  })
  }catch(error){
    next(error)
  }
}

//---------------------------------------
// Logout function to clear JWT cookie and redirect to home page
//---------------------------------------
async function accountLogout(req, res, next) {
  try{
    res.clearCookie("jwt")
    res.redirect("/")
  } catch(error){
    next(error)
  }
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  let loginLink = await utilities.buildLoginLink(req, res)
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try{
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  }catch(error){
    req.flash("notice", "Sorry, there was an error processing your registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      loginLink,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      errors: null,
      loginLink,
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      loginLink,
      errors: null,
  })
  }
}



/* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res) {

  let nav = await utilities.getNav()
  let loginLink = await utilities.buildLoginLink(req, res)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      loginLink,
      errors: null,
      account_email
    })
    return
  }
  
  try {
    if(await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 }) // 1 hour
      if(process.env.NODE_ENV === 'development'){
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 }) // 1 hour
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 }) // 1 hour
      }
      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        loginLink,
        errors: null,
        account_email
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
}
}

//---------------------------------------
// Process edit account information
//---------------------------------------
async function editInfo(req, res) {
  let nav = await utilities.getNav()
  let loginLink = await utilities.buildLoginLink(req, res)
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.editInfo(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) {
    console.log(`AccountController - editInfo --- Update successful for account ID: ${account_id}`)
    req.flash("notice", "Account information updated successfully.")

    const updatedAccountData = await accountModel.getAccountById(account_id)
    delete updatedAccountData.account_password
    const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 }) // 1 hour
    if(process.env.NODE_ENV === 'development'){
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 }) // 1 hour
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 }) // 1 hour
    }

      res.redirect("/account")
  } else {
    console.log("AccountController - editInfo --- Update failed for account ID:", account_id)
    req.flash("notice", "Sorry, there was an error updating your account information.")
    res.status(500).render("account/edit-info", {
      title: "Edit Account Information",
      nav,
      loginLink,
      errors: null,
      accountData: { account_id, account_firstname, account_lastname, account_email }
    })
  }
}

//---------------------------------------
// Process Password Change
//---------------------------------------
async function editPassword(req, res) {
  let nav = await utilities.getNav()
  let loginLink = await utilities.buildLoginLink(req, res)
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hashSync(account_password, 10)
  const updateResult = await accountModel.editPassword(account_id, hashedPassword)
  if (updateResult) {
    console.log(`AccountController - editPassword --- Password change successful for account ID: ${account_id}`)
    req.flash("notice", "Password changed successfully.")
    res.redirect("/account")
  } else {
    console.log("AccountController - editPassword --- Password change failed for account ID:", account_id)
    req.flash("notice", "Sorry, there was an error changing your password.")
    res.status(501).render("account/edit-info", {
      title: "Change Password",
      nav,
      loginLink,
      errors: null,
      account_id
    })
  }
}



module.exports = { buildLogin, buildRegister, buildAccount, registerAccount, accountLogin, buildEditInfo, editInfo, editPassword, accountLogout }