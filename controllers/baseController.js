const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilities.getNav()
    res.render("index", {title: "Home", nav})
}

baseController.testError = async function(req, res, next){
    const nav = await utilities.getNav()
    // Gave you an intentional error to test the error handler
    const err = new Error("Intentional Test Error")
    err.status = 500
    next(err)
}

module.exports = baseController