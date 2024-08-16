const express = require('express')
const bcrypt = require('bcryptjs')
const jwt =require('jsonwebtoken')
const User = require('./userModel')

const bodyParser =require('body-parser')

require('dotenv').config();
const router = new express.Router()

const Auth = (req,res,next)=>{
    const token = req.cookies.token
      
      if(!token){
        return res.redirect('/login')
      }
    try{
      const decoded = jwt.verify(token,process.env.JWT_SECRET)
      req.user = decoded
      next()
    
    }catch(error){
        res.redirect('/login')
      }
      
  }

router.get('/signup',(req,res)=>{
    // res.render('signup')
})
router.get('/home',Auth,(req,res)=>{
    
    try{
    /*res.render('Home')*/}catch(error){
        res.redirect('/login')
    }
})
router.get('/admin',(req,res)=>{
    const token = req.cookies.token
    if(!token){
        res.redirect('/login')
    }
    const user = jwt.verify(token,process.env.JWT_SECRET)
    if('admin'.includes(user.role)){
        req.user =user
        // res.render('admin')
    }else{
        res.status(403).send('Access Denied, You are restricted from this end')
    }
})

router.post('/register',async (req,res)=>{
try{
const {name, password,email } = req.body;
if (!name || !password ||!email) return res.status(400).send('Missing username or password');

const hashedPassword = await bcrypt.hash(password, 8);
const user = new User({ name,email, password:hashedPassword ,tokens: [], role:'user' });
await user.save()

const token = jwt.sign({ id: user._id,role:user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Strict'})
res.redirect('/home')
} catch(err) {
console.error('Error during signup:', err);
res.status(400).send(err.message);
}

      
   
    
})
router.get('/login',(req,res)=>{
    // res.render('login')
    res.send('home')
})

router.post('/login', async(req,res)=>{
    try{
    const {name,password}=req.body
    const user = await User.findOne({name})
    if(!user){
        return res.status(401).send('Invalid Username')

    }
    
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(401).send('Invalid Password')
    }
     const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET)
     res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'Strict'})
    res.redirect('/home')
   
}catch(err){console.error(err)}
})

router.post('/logout',(req,res)=>{
    const token = req.cookies.token
    if(!token){res.redirect('/login')}
    try{
        const user = jwt.verify(token,process.env.JWT_SECRET)
        req.user = user
        res.clearCookie('token',{httpOnly:true,secure:true,sameSite:'Strict'})
        res.redirect('/login')
    }catch(error){
        res.redirect('/login')
    }
})

 router.get('/training/section',Auth,(req,res)=>{
   
} )

router.get('/blog',Auth,(req,res)=>{
    
})


module.exports =router
