const validateBody = (schema) => (req, res, next) => {
    try {
        const { error } = schema.validate(req.body ?? {})
        if (error) {
            return res.status(400).send({
                message: error.details[0].message
            })
        }
        next()
    } catch (error) {
        return res.status(500).send({
            message: error.message
        })
    }
}

module.exports = validateBody