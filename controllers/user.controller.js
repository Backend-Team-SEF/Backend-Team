const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User.model")

const HIDDEN_FIELDS = "-password -tokens -resetPasswordToken -resetPasswordExpire -__v"

const sanitize = (user) => {
    const obj = user.toObject()
    delete obj.password
    delete obj.tokens
    delete obj.resetPasswordToken
    delete obj.resetPasswordExpire
    delete obj.__v
    return obj
}

const isAdmin = (user) => user.role === "Admin"

const userController = {
    getMe: async (req, res) => {
        res.status(200).send({ data: sanitize(req.user) })
    },

    updateUser: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ message: "Invalid user id" })
            }

            const isOwner = req.user._id.equals(id)
            if (!isOwner && !isAdmin(req.user)) {
                return res.status(403).send({ message: "You can only update your own account" })
            }

            const user = await User.findById(id)
            if (!user) {
                return res.status(404).send({ message: "User not found" })
            }

            const { username, phone, avatar, address, currentPassword, newPassword } = req.body

            if (username !== undefined) user.username = username
            if (phone !== undefined) user.phone = phone
            if (avatar !== undefined) user.avatar = avatar
            if (address !== undefined) user.address = address
            if (newPassword) {
                if (!isOwner) {
                    return res.status(403).send({ message: "Only the account owner can change the password" })
                }
                const isMatch = await bcrypt.compare(currentPassword, user.password)
                if (!isMatch) {
                    return res.status(400).send({ message: "Current password is incorrect" })
                }
                user.password = newPassword
            }

            await user.save()
            res.status(200).send({ message: "User updated successfully", data: sanitize(user) })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    addUser: async (req, res) => {
        try {
            const { username, email, password, phone, role } = req.body

            const exists = await User.findOne({ email })
            if (exists) {
                return res.status(409).send({ message: "Email is belonging to anthor user" })
            }

            const user = await User.create({ username, email, password, phone, role, isVerified: true })
            res.status(201).send({ message: "User created successfully", data: sanitize(user) })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1)
            const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100)
            const skip = (page - 1) * limit

            const [users, total] = await Promise.all([
                User.find().select(HIDDEN_FIELDS).sort({ _id: -1 }).skip(skip).limit(limit),
                User.countDocuments()
            ])

            res.status(200).send({ total, page, pages: Math.ceil(total / limit), data: users })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    getUser: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ message: "Invalid user id" })
            }
            const user = await User.findById(id).select(HIDDEN_FIELDS)
            if (!user) {
                return res.status(404).send({ message: "User not found" })
            }
            res.status(200).send({ data: user })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).send({ message: "Invalid user id" })
            }
            if (req.user._id.equals(id)) {
                return res.status(400).send({ message: "You cannot delete your own account" })
            }
            const user = await User.findByIdAndDelete(id)
            if (!user) {
                return res.status(404).send({ message: "User not found" })
            }
            res.status(200).send({ message: "User deleted successfully" })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    }
}

module.exports = userController