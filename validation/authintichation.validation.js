const joi = require("joi")


const registerationScema = joi.object({
    username: joi.string().trim(),
    email: joi.string().email().required(),
    password: joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])"))
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number, and special character",
            "string.min":
                "Password must be at least 8 characters",
            "string.max":
                "Password must not exceed 30 characters"
        }),
    phone: joi.string().required().regex(/^01\d{9}$/),
    avatar: joi.string(),
})

const loginSchema = joi.object({
    email: joi.string().email(),
    password: joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])"))
        .required()
        .messages({
            "string.pattern.base":
                "Password must contain uppercase, lowercase, number, and special character",
            "string.min":
                "Password must be at least 8 characters",
            "string.max":
                "Password must not exceed 30 characters"
        }),
})



module.exports = {
    registerationScema,
    loginSchema
}