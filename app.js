const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
 const router= require('./users/userRoute')
 const path = require('path')
 const adminRoute = require('./users/adminRoute')
 const productRoute = require('./Product/productRoute')
 const MongoStore = require('connect-mongo')
const axios = require('axios');
const cors = require('cors');

 
require('dotenv').config()
MongoDburl= "mongodb+srv://practice1:Prince5As@cluster-practice.hkar1p0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-practice"


const app =express()
const PORT=process.env.PORT
//const MongoDburl =process.env.MongoDburl
app.use(express.static('Views'))
//app.use(express.urlencoded())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors({ origin: 'http://localhost:3001' }));
app.use(session({secret:'mysupersecret',
    resave:false,
    saveUninitialized:false,
    store: new MongoStore({mongoUrl:"mongodb+srv://practice1:Prince5As@cluster-practice.hkar1p0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-practice"
    }),
    cookie:{maxAge:180*60*1000}
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, '../FRONTEND/build','index.html')));

mongoose.connect(MongoDburl,{useNewUrlParser:true,useUnifiedTopology:true})
    .then(()=>(console.log('Succesfully connected to the database')))
    .catch((err)=>console.log(err))
    
app.listen(PORT, (req,res)=>{
     console.log(`Listening for request at port ${PORT}`)
    })    
app.use(router)
app.use(productRoute)
app.use(adminRoute)

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/FRONTEND/build/index.html'));
// });