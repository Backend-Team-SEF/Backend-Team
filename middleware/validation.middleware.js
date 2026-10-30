const { registerationScema, loginSchema } = require("../validation/authintichation.validation");

function registeration(req, res, next) {
    try {
        const { error } = registerationScema.validate(req.body);
        if (error) {
            return res.status(400).send({
                message: error.details[0].message
            });
        }
        next();

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}
function login(req, res, next) {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).send({
                message: error.details[0].message
            });
        }
        next();

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}


const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.details.map((detail) => detail.message),
        });
    }

    req.body = value;
    next();
};



module.exports ={
    registeration,
    login,
    validate
}