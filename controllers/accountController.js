const accountModel = require("../models/account-model")
const utilities = require("../utilities/")

const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  try{
    let nav = await utilities.getNav()
    res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
  }catch(error){
    next(error)
  }
  
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
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
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
  })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  
  // TODO: Implement login logic here
  const account = await accountModel.getAccountByEmail(account_email)
  console.log("Function: loginAccount --- Account:", account)
  if (!account) {
    console.log("Function: loginAccount --- Email does not exist")
    req.flash("notice", "Email does not exist.")
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
    return
  }
  console.log("Function: loginAccount --- Account password given in the form:", account_password)
  console.log("Function: loginAccount --- Account password from DB:", account.account_password)
  const passwordMatch = await utilities.comparePassword(account_password, account.account_password)
  console.log("Function: loginAccount --- Password Match:", passwordMatch)
  if (!passwordMatch) {
    console.log("Function: loginAccount --- Incorrect password")
    req.flash("notice", "Incorrect password.")
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
    return
  }
  req.session.account = account
  res.redirect("/account/dashboard")
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }