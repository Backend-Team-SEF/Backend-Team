const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const { authintication, AminAuthintication } = require("../middleware/authintication.middleware")
const validateBody = require("../middleware/validateBody.middleware")
const { addUserSchema, updateUserSchema } = require("../validation/user.validation")

router.get("/all", AminAuthintication, userController.getAllUsers)
router.post("/add", AminAuthintication, validateBody(addUserSchema), userController.addUser)
router.get("/:id", AminAuthintication, userController.getUser)
router.patch("/:id", authintication, validateBody(updateUserSchema), userController.updateUser)
router.delete("/:id", AminAuthintication, userController.deleteUser)

module.exports = router