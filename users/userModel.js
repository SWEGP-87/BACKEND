const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt =require('jsonwebtoken')
const Schema = mongoose.Schema

const user = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error('Invalid email');
                }
            }

    },
    password:{
           type:String,
           required:true,
           minLength:7,
           trim:true,
           validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not contain password')
            }
           }

    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    role:{
        type:String,
        required:true,
        enum:['admin','user'],
        default:'user'
    }
    
})



const User = mongoose.model('User',user)
module.exports = User

