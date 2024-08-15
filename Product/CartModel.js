const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('../users/userModel')
const Product = require('./productModel')

const cartItems = new Schema({
    userId: {
        type: Schema.Types.ObjectId,ref:'User',
        required:true
    },

    items:[{
        productId:{type:String,required:true},
        productName:{type:String,required:true},
        productPrice:{type:Number,required:true},
        productImage:{type:String,required:true},
       quantity:{type: Number,default:1}
    }],
    createdAt: { type: Date, default: Date.now, expires: '1d' }
})

const Cart = mongoose.model('Cart',cartItems)
module.exports = Cart