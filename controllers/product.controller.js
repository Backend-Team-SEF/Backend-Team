const mongoose = require("mongoose")
const Product = require("../models/Product.model")

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1)
            const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100)
            const skip = (page - 1) * limit

            const query = { isActive: true }

            if (req.query.category) {
                query.category = req.query.category.toLowerCase().trim()
            }

            if (req.query.brand) {
                query.brand = req.query.brand.trim()
            }

            if (req.query.featured !== undefined) {
                query.featured = req.query.featured === "true"
            }

            if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
                query.price = {}
                if (req.query.minPrice !== undefined) {
                    query.price.$gte = Number(req.query.minPrice)
                }
                if (req.query.maxPrice !== undefined) {
                    query.price.$lte = Number(req.query.maxPrice)
                }
            }

            let sortOption = { createdAt: -1 }
            if (req.query.sort) {
                if (req.query.sort === "price") {
                    sortOption = { price: 1 }
                } else if (req.query.sort === "-price") {
                    sortOption = { price: -1 }
                } else if (req.query.sort === "rating") {
                    sortOption = { averageRating: -1 }
                }
            }

            const [products, total] = await Promise.all([
                Product.find(query)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit),
                Product.countDocuments(query)
            ])

            res.status(200).send({
                total,
                page,
                pages: Math.ceil(total / limit),
                data: products
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    getProductById: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ message: "Invalid product id" })
            }

            const product = await Product.findById(id).populate("reviews.user", "username avatar")
            if (!product) {
                return res.status(404).send({ message: "Product not found" })
            }

            res.status(200).send({ data: product })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    createProduct: async (req, res) => {
        try {
            const {
                name,
                shortDescription,
                description,
                price,
                discountPrice,
                stock,
                sku,
                images,
                category,
                subcategory,
                brand,
                tags,
                featured,
                isActive
            } = req.body

            let productImages = []
            if (Array.isArray(images) && images.length > 0) {
                productImages = images
            } else if (req.files && Array.isArray(req.files)) {
                productImages = req.files.map((file) => ({
                    public_id: file.filename || file.originalname,
                    url: file.path
                }))
            }

            const product = await Product.create({
                name,
                shortDescription,
                description,
                price,
                discountPrice: discountPrice || 0,
                stock,
                sku,
                images: productImages,
                category,
                subcategory,
                brand,
                tags,
                featured,
                isActive,
                createdBy: req.user._id
            })

            res.status(201).send({
                message: "Product created successfully",
                data: product
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    updateProduct: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ message: "Invalid product id" })
            }

            const product = await Product.findById(id)
            if (!product) {
                return res.status(404).send({ message: "Product not found" })
            }

            const {
                name,
                shortDescription,
                description,
                price,
                discountPrice,
                stock,
                sku,
                images,
                deletedImages,
                category,
                subcategory,
                brand,
                tags,
                featured,
                isActive
            } = req.body

            if (name !== undefined) product.name = name
            if (shortDescription !== undefined) product.shortDescription = shortDescription
            if (description !== undefined) product.description = description
            if (price !== undefined) product.price = price
            if (discountPrice !== undefined) product.discountPrice = discountPrice
            if (stock !== undefined) product.stock = stock
            if (sku !== undefined) product.sku = sku
            if (category !== undefined) product.category = category
            if (subcategory !== undefined) product.subcategory = subcategory
            if (brand !== undefined) product.brand = brand
            if (tags !== undefined) product.tags = tags
            if (featured !== undefined) product.featured = featured
            if (isActive !== undefined) product.isActive = isActive

            if (Array.isArray(deletedImages) && deletedImages.length > 0) {
                product.images = product.images.filter(
                    (img) => !deletedImages.includes(img.public_id)
                )
            }

            if (Array.isArray(images) && images.length > 0) {
                product.images = product.images.concat(images)
            } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                const newUploaded = req.files.map((file) => ({
                    public_id: file.filename || file.originalname,
                    url: file.path
                }))
                product.images = product.images.concat(newUploaded)
            }

            await product.save()

            res.status(200).send({
                message: "Product updated successfully",
                data: product
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ message: "Invalid product id" })
            }

            const product = await Product.findByIdAndDelete(id)
            if (!product) {
                return res.status(404).send({ message: "Product not found" })
            }

            res.status(200).send({ message: "Product deleted successfully" })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    addReview: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ message: "Invalid product id" })
            }

            const product = await Product.findById(id)
            if (!product) {
                return res.status(404).send({ message: "Product not found" })
            }

            const alreadyReviewed = product.reviews.find(
                (review) => review.user.equals(req.user._id)
            )

            if (alreadyReviewed) {
                return res.status(400).send({ message: "You have already reviewed this product" })
            }

            const { rating, comment } = req.body

            const review = {
                user: req.user._id,
                name: req.user.username || "Customer",
                rating: Number(rating),
                comment: comment.trim()
            }

            product.reviews.push(review)
            product.calcAverageRating()

            await product.save()

            res.status(201).send({
                message: "Review added successfully",
                data: product
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    deleteReview: async (req, res) => {
        try {
            const { id, rid } = req.params
            if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(rid)) {
                return res.status(400).send({ message: "Invalid id" })
            }

            const product = await Product.findById(id)
            if (!product) {
                return res.status(404).send({ message: "Product not found" })
            }

            const review = product.reviews.find((r) => r._id.equals(rid))
            if (!review) {
                return res.status(404).send({ message: "Review not found" })
            }

            const isOwner = review.user.equals(req.user._id)
            const isAdmin = req.user.role === "Admin"

            if (!isOwner && !isAdmin) {
                return res.status(403).send({ message: "You can only delete your own review" })
            }

            product.reviews = product.reviews.filter((r) => !r._id.equals(rid))
            product.calcAverageRating()

            await product.save()

            res.status(200).send({
                message: "Review deleted successfully",
                data: product
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    getProductReviews: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ message: "Invalid product id" })
            }

            const product = await Product.findById(id).populate("reviews.user", "username avatar")
            if (!product) {
                return res.status(404).send({ message: "Product not found" })
            }

            res.status(200).send({
                total: product.reviews.length,
                data: product.reviews
            })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    }
}

module.exports = productController
