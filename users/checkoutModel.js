const mongoose = require('mongoose')
const Schema = mongoose.Schema

const checkout = new Schema({
    shippingName:{type:String,
        required:true},
    shippingAddress:{type:String,
        required:true},
    shippingCity:{type:String,
        required:true},
    shippingState:{type:String, 
        required:true}
})

const Checkout = mongoose.model('Checkout',checkout)
module.exports =Checkout