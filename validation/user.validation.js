const joi = require("joi")

const phonePattern = /^01\d{9}$/

const passwordRule = joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])"))
    .messages({
        "string.pattern.base":
            "Password must contain uppercase, lowercase, number, and special character",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must not exceed 30 characters"
    })


const updateUserSchema = joi.object({
    username: joi.string().trim().min(2).max(50),
    phone: joi.string().pattern(phonePattern),
    avatar: joi.string().uri(),
     address: joi.array().items(joi.string().trim().min(5).max(200)),
    currentPassword: joi.string(),
    newPassword: passwordRule
}).min(1).with("newPassword", "currentPassword")

const addUserSchema = joi.object({
    username: joi.string().trim().min(2).max(50).required(),
    email: joi.string().email().required(),
    password: passwordRule.required(),
    phone: joi.string().pattern(phonePattern).required(),
    role: joi.string().valid("Admin", "customer")
})

module.exports = {
    updateUserSchema,
    addUserSchema
}