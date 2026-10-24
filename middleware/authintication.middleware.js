const User = require("../models/User.model")
const jwt = require("jsonwebtoken")


const authintication = async (req, res, next) => {
    const token = req?.cookies?.access_token?.split(" ")[1]
    if (!token) {
        return res.status(401).send({ message: "token is requierd" })
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY)
    if (!decode) {
        return res.status(401).send({ message: "token is requierd" })
    }
    const user = await User.findById(decode.id)
    if (!user) {
        return res.status(401).send({ message: "UN Authorized User" })
    }
    delete user.password
    delete user.tokens
    req.user = user
    next()
}

const AminAuthintication = async (req, res, next) => {
    try {
        authintication(req, res, () => {
            if (!req.user) {
                return res.status(401).send({ message: "UN Authorized User" })
            }
            if (req.user.role !== "Admin") {
                return res.status(403).send({ message: "Access denied. Admin only" })
            }
            next()
        })
    }
    catch (error) {
        res.status(500).send({ message: error.message })
    }



}

module.exports = {
    authintication,
    AminAuthintication
}