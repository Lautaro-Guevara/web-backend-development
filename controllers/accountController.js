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

//-------------------
// Deliver account management view
//---------------------------------------
async function buildAccount(req, res, next) {
  try{
    let nav = await utilities.getNav()
    res.render("account/account", {
    title: "Account Management",
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
      errors: null,
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
// async function loginAccount(req, res, next) {
//   try{
//     let nav = await utilities.getNav()
//       const { account_email, account_password } = req.body
      
//       // TODO: Implement login logic here
//       const account = await accountModel.getAccountByEmail(account_email)
//       console.log("Function: accountLogin --- Account:", account)
//       if (!account) {
//         console.log("Function: accountLogin --- Email does not exist")
//         req.flash("notice", "Email does not exist.")
//         res.render("account/login", {
//           title: "Login",
//           nav,
//           errors: null
//         })
//         return
//       }
//       console.log("Function: accountLogin --- Account password given in the form:", account_password)
//       console.log("Function: accountLogin --- Account password from DB:", account.account_password)
//       const passwordMatch = await utilities.comparePassword(account_password, account.account_password)
//       console.log("Function: accountLogin --- Password Match:", passwordMatch)
//       if (!passwordMatch) {
//         console.log("Function: accountLogin --- Incorrect password")
//         req.flash("notice", "Incorrect password.")
//         res.render("account/login", {
//           title: "Login",
//           nav,
//           errors: null
//         })
//         return
//       }
//       req.session.account = account
//       res.status(200).send("Login successful.")
      
//   }catch(error){
//     next(error)
//   }
// }

async function accountLogin(req, res) {

  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
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
        errors: null,
        account_email
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
}
}

module.exports = { buildLogin, buildRegister, buildAccount, registerAccount, accountLogin }