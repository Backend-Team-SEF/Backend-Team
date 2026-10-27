const mongoose = require("mongoose")
const { type } = require("node:os")

const cartItemSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name:{
        type: String
    },
    image:{
        type: String,

    },
    price:{
        type : Number,
        required: true
    },
    quantity:{
        type: Number , 
        required : true,
        default: 1

    }
})

const cartSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        unique: true
    },
    items:[cartItemSchema],
    coupon:{
        code:{type: String , uppercase: true},
        discountType:{type: String, enum:["percentage" , "fixed"]},
        discountValue:{type: Number , default: 0}
    }
},{
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
})

cartSchema.virtual("subtotal").get(function(){
    return this.items.reduce( (acc , item) => acc + (item.price*item.quantity) , 0)
})

cartSchema.virtual("discountAmount").get(function(){
    if(!this.coupon || !this.coupon.discountValue){
        return 0
    }
    if(this.coupon.discountType==="percentage"){
        return(this.subtotal * this.coupon.discountValue)/100
    }
    else if(this.coupon.discountType === "fixed"){
        return(this.coupon.discountValue)
    }
    return 0;
})

cartSchema.virtual("total").get(function(){
    const finalTotal = this.subtotal - this.discountAmount
    if(finalTotal>0 ){
        return finalTotal
    }
    else{
        return 0
    }
})

cartSchema.virtual("itemCount").get(function(){
    if(!this.items) return 0
    return this.items.reduce( (acc , item)=>acc+item.quantity , 0 )
})

const Cart = mongoose.model("Cart" , cartSchema)

module.exports = Cart