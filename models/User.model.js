import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    username: {
        required: true,
        trim: true,
        type: String
    },
     email: {
        required: true,
        trim: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        trim: true,
        type: String,
        minlength: 8
    },
        phone: {
        type: String
    },
         avatar: {
        type: String
    },
        role: {
        type: String,
        enum: ["Admin", "customer"],
        default: "customer"
    },
     address: [{ type: String }],
         isVerified: {
        type: Boolean,
        default: false
    },
         resetPasswordToken: {
        type: String
    },

    resetPasswordExpire: {
        type: Date
    },

    tokens: [{
        type: String,
        trim: true
    }]
});
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 8);
});
const User = mongoose.model("User", userSchema);
export default User;