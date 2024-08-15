const mongoose = require('mongoose')
const Schema = mongoose.Schema



const orderSchema = new Schema({
    userId :{
        type:mongoose.Schema.Types.ObjectId, ref:'User',
        required:true
    },
    name:{
        type:String,
        required:true 
    },
    items:[{
        productId:{type:mongoose.Schema.Types.ObjectId, ref:'Cart',required:true},
        productName:{type:String,required:true},
        productPrice:{type:String,required:true},
        productImage:{type:String,required:true},
       quantity:{type:Number}
    }

    ],
    status:{
        type:String,
        enum:['Pending','Processing','Canceled','Shipped','Delivered'],
        default:'Pending',
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    createdAt: { type: Date, default: Date.now, expires: '7d' }

    

})
const Order = mongoose.model('Order',orderSchema)
module.exports = Order