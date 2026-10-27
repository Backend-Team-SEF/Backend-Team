const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

userSchema = mongoose.Schema({
    username: {required: true, trim: true, type: String },
    email: { required: true,trim: true,type: String, unique: true,lowercase : true},
    password: {required: true,trim: true,type: String,minlength: 8},
    phone: {type: String},
    avatar:{ type: String},
    role: {type: String , enum: ["Admin", "customer"], default: "customer"},
    address:[{type: String}],
    wishlist:{type: mongoose.Schema.Types.ObjectId , ref : "Product"} ,
    isVerified: {type: Boolean,default: false},
    resetPasswordToken: {type: String },
    resetPasswordExpire: {type: Date },
    tokens: [{required: true,type: String, trim: true, expires: "2d"}]
    })
    
userSchema.pre("save", async function () {
    try {
        const user = this
        if (user.isModified("password")) {
            user.password = await bcrypt.hash(user.password, 8)
        }
    }
    catch (e) {
        e.message
    }}) 

    userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model("User", userSchema)
module.exports = User