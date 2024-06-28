const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
 const UserRouter= require('./Login/Login')
require('dotenv').config()
MongoDburl= "mongodb+srv://practice1:Prince5As@cluster-practice.hkar1p0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-practice"

const app =express()
const PORT=process.env.PORT
//const MongoDburl =process.env.MongoDburl

app.use(express.urlencoded())
app.set('view engine','ejs')
app.set('views','Views')

app.use(express.json())
app.use(express.urlencoded({extended:true}))
mongoose.connect(MongoDburl,{useNewUrlParser:true,useUnifiedTopology:true})
    .then(()=>app.listen(PORT,(req,res)=>{
        console.log('Listening for a request')
    }))
    .catch((err)=>console.log(err))

app.use(UserRouter)