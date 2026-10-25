const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const { registeration, login } = require("../middleware/validation.middleware")
router.post("/register", registeration, authController.register)
router.post("/login", login, authController.login)
router.post("/logout", authController.logout)


const { authintication } = require("../middleware/authintication.middleware")
const userController = require("../controllers/user.controller")
router.get("/me", authintication, userController.getMe)

module.exports = router
