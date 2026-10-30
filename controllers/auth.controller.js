const User = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const authController = {
    register: async (req, res) => {
        try {
            const checkemail = await User.findOne({ email: req.body.email })
            if (checkemail) {
                return res.status(409).send({ message: "Email is belonging to anthor user " })
            }
            const user = new User(req.body)
            await user.save()
            res.status(201).send({ message: "Account Created Successfully !!" })
        }
        catch (err) {
            res.send(err)
        }

    },
    login: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                return res.status(401).send("You Entered Wrong E-mail")
            }
            const isMatch = await user.comparePassword(req.body.password)
            if (!isMatch) {
                return res.status(401).send("You Entered Wrong Password")
            }
            const secritKey = process.env.SECRET_KEY
            const token = await jwt.sign({ id: user._id }, secritKey) //////////Creation of Token 
            res.cookie("access_token", `Bearer ${token}`, {
                maxAge: 1000 * 60 * 60 * 24 * 2,
                httpOnly: true,
            })
            user.tokens.push(token)
            await user.save()
            res.status(202).send({ message: "you Are Welcome",token })

        } catch (error) {
            return res.status(500).send({
                message: error.message
            });
        }
    },
    logout: async (req, res) => {
        try {
            res.cookie("access_token", " ", { maxAge: 0 })
            res.status(202).send({ message: "logout Successfully" })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    }
}

module.exports = authController