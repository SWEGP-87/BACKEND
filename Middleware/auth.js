const express = require ('express')
const User =require('./Loginmodel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const authToken = (req,res,next)=>{
    
    const token = req.header('Authorization').split('')[1]
    if(!token){res.sendStatus(401)}
    
    try{
    const user = jwt.verify(token,process.env.JWT_SECRET)
    req.user = user
    next()

}catch(err){
    res.status(403).send(err.message)
}
}

module.exports = authToken