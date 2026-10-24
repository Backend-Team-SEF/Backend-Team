const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const { registeration, login } = require("../middleware/validation.middleware")
router.post("/register", registeration, authController.register)
router.post("/login", login, authController.login)
router.post("/logout", authController.logout)


module.exports = router
