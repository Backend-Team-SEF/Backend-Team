const express = require("express")
const router = express.Router()
const authRouter = require("./auth.route")
const productRouter = require("./product.route")

router.use("/auth", authRouter)
router.use("/products", productRouter)

module.exports = router