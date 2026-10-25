const express = require("express")
const router = express.Router()
const productController = require("../controllers/product.controller")
const { authintication, AminAuthintication } = require("../middleware/authintication.middleware")
const {
    createProductSchema,
    updateProductSchema,
    reviewSchema
} = require("../validation/product.validation")

const validate = (schema) => (req, res, next) => {
    try {
        const { error } = schema.validate(req.body)
        if (error) {
            return res.status(400).send({ message: error.details[0].message })
        }
        next()
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

router.get("/", productController.getAllProducts)
router.get("/:id", productController.getProductById)
router.post("/", AminAuthintication, validate(createProductSchema), productController.createProduct)
router.put("/update/:id", AminAuthintication, validate(updateProductSchema), productController.updateProduct)
router.delete("/:id", AminAuthintication, productController.deleteProduct)

router.get("/:id/reviews", productController.getProductReviews)
router.post("/:id/reviews", authintication, validate(reviewSchema), productController.addReview)
router.delete("/:id/reviews/:rid", authintication, productController.deleteReview)

module.exports = router
