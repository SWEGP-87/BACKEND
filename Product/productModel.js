const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('../users/userModel')

const product = new Schema({

    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        requied:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
},{timestamps:true})

const Product = mongoose.model('Product',product)
module.exports = Product