const express = require("express")
const router = express.Router()
const authRouter = require("./auth.route")
const userRouter = require("./user.route")
router.use("/auth",authRouter)
router.use("/users", userRouter)
const productRouter = require("./product.route")

router.use("/auth", authRouter)
router.use("/products", productRouter)

const adminRouter = require("./admin.route")
router.use("/admin", adminRouter)

module.exports = router