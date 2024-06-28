const express = require('express')
const bcrypt = require('bcryptjs')
const jwt =require('jsonwebtoken')
const User = require('./Loginmodel')
const authToken = require('./Middleware/auth')
const bodyParser =require('body-parser')
require('dotenv').config();
const router = new express.Router()

router.get('/signup',(req,res)=>{
    res.render('signup')
})
router.post('/signup',async (req,res)=>{
try{
const {name, password,email } = req.body;
if (!name || !password ||!email) return res.status(400).send('Missing username or password');

const hashedPassword = await bcrypt.hash(password, 8);
const user = new User({ name,email, password:hashedPassword ,tokens: [] });

const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
user.tokens = user.tokens.concat({ token });

await user.save();

res.status(201).send(token);
} catch(err) {
console.error('Error during signup:', err);
res.status(400).send(err.message);
}

      
   
    
})
router.get('/login',(req,res)=>{
    res.render('login')
})

router.post('/login', async(req,res)=>{
    try{
    const {name,password}=req.body
    const user = await User.findOne({name})
    if(!user){
        return res.status(400).send('Invalid Credentials')

    }
    //const hashedPassword= await bcrypt.hash(password,8)
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(400).send('Invalid Credentials')
    }
     const token = jwt.sign({id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens= user.tokens.concat({token})
    await user.save()
    res.send(token)}catch(err){console.error(err)}
})

router.post('/logout',auth,(req,res)=>{
    res.send('Logout Successfully')
} )
module.exports =router
