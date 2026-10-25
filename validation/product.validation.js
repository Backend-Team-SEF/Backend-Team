const joi = require("joi")

const createProductSchema = joi.object({
    name: joi.string().trim().max(200).required(),
    shortDescription: joi.string().trim().max(500).required(),
    description: joi.string().trim().required(),
    price: joi.number().min(0).required(),
    discountPrice: joi.number().min(0).default(0),
    stock: joi.number().min(0).required(),
    sku: joi.string().trim().allow(""),
    images: joi.array().items(
        joi.object({
            public_id: joi.string().required(),
            url: joi.string().required()
        })
    ),
    category: joi.string().trim().required(),
    subcategory: joi.string().trim().allow(""),
    brand: joi.string().trim().allow(""),
    tags: joi.array().items(joi.string().trim()),
    featured: joi.boolean(),
    isActive: joi.boolean()
})

const updateProductSchema = joi.object({
    name: joi.string().trim().max(200),
    shortDescription: joi.string().trim().max(500),
    description: joi.string().trim(),
    price: joi.number().min(0),
    discountPrice: joi.number().min(0),
    stock: joi.number().min(0),
    sku: joi.string().trim().allow(""),
    images: joi.array().items(
        joi.object({
            public_id: joi.string().required(),
            url: joi.string().required()
        })
    ),
    deletedImages: joi.array().items(joi.string().trim()),
    category: joi.string().trim(),
    subcategory: joi.string().trim().allow(""),
    brand: joi.string().trim().allow(""),
    tags: joi.array().items(joi.string().trim()),
    featured: joi.boolean(),
    isActive: joi.boolean()
}).min(1)

const reviewSchema = joi.object({
    rating: joi.number().min(1).max(5).required(),
    comment: joi.string().trim().required()
})

module.exports = {
    createProductSchema,
    updateProductSchema,
    reviewSchema
}
