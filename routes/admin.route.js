const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")
const { AminAuthintication } = require("../middleware/authintication.middleware")

// every route here is Admin only
router.get("/dashboard", AminAuthintication, adminController.getDashboard)
router.get("/carts", AminAuthintication, adminController.getAllCarts)
router.get("/wishlists", AminAuthintication, adminController.getAllWishlists)
router.get("/wishlists/stats", AminAuthintication, adminController.getWishlistStats)

module.exports = router
