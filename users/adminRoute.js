const express = require('express')
const User = require('./userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Product = require('../Product/productModel')
const Order = require('../Product/OrderModel')
const adminRoute = new express.Router()
require('dotenv').config()

const Auth = (req,res,next)=>{
    const token = req.cookies.token
if(!token){
  return  res.status(401).send('Access Denied. No token was provided')
}
try{
const decoded = jwt.verify(token,process.env.JWT_SECRET)
if('admin'.includes(decoded.role)){
    req.user=decoded
    next()
}else{
    res.status(401).send('Unauthorized Access')
}
}catch(error){
    res.status(401).send('Access Denied')
}}


adminRoute.get('/admin/login',(req,res)=>{
    res.render('adminLogin')
})

adminRoute.post('/admin/login', async (req,res)=>{
    const {name,password} = req.body
 try{
    const admin =await User.findOne({name})
    if(!admin){
       return res.status(401).send('Invalid Username')
    }
    const isMatch =await bcrypt.compare(password,admin.password)
    if(!isMatch){
       return res.status(401).send('Invalid Password')
    }
    const isAdmin = 'admin'.includes(admin.role)
    if(!isAdmin){
       return res.status(403).send('Unauthorized Access')
    }
    const token = jwt.sign({id:admin._id,role:admin.role},process.env.JWT_SECRET,{expiresIn:'1h'})
    res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'strict'})
    res.redirect('/dashboard')
 }catch(error){
    res.status(301).send('error')
 }
})

adminRoute.get('/dashboard',Auth,(req,res)=>{
try{
  res.render('adminDashboard') 
}
catch(error){
    res.status(403).send('Access Denied')
}
})

adminRoute.get('/admin/products',async(req,res)=>{
    const token = req.cookies.token
    if(!token){
        res.redirect('/admin/login')
    }
    try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    if('admin'.includes(decoded.role)){
        req.user = decoded
        const products = await Product.find()
        res.render('adminManageProducts',{products:products})
    }else{
        res.status(403).send('Access Denied')
    }}catch(error){

    }
})
adminRoute.post('/add-product',Auth,async (req,res)=>{
    const {name,description,image,price} = req.body
    try{
    const newProduct = Product({
        name:name,
        image:image,
        description:description,
        price:price
    })
    await newProduct.save()
    res.status(200).send('New Product Added')}catch(error){
        console.log(error)
    }

})

adminRoute.get('/delete-product/:id',Auth,async(req,res)=>{
    const{id} =req.params
    console.log(id)

    try{
        await Product.findByIdAndDelete(id)
        res.status(200).send('Delete Successful')
    }catch(error){
         console.error(error)
         res.status(500).send('An error whiles deleting')
    }

})
adminRoute.get('/edit-product/:id',Auth,async (req,res)=>{
    const {id} = req.params
    try{
        const product = await Product.findById(id)
        res.render('adminEditProduct',{product:product})


    }catch(error){

    }
    
})
adminRoute.post('/edit-product/:id',Auth,async(req,res)=>{
    const {id} =req.params
    const {name,description,image,price} = req.body
    try{
        await Product.findByIdAndUpdate(id,{
            name:name,
            description:description,
            image:image,
            price:price })
          return  res.status(200).redirect('/admin/products')

    }catch(error){
        console.log(error)
        res.status(500).send('Error Ocurred whiles Updating Product')

    }
})
adminRoute.get('/admin/orders',Auth,async(req,res)=>{
    const orders =await Order.find()
    try{
    if(!orders){
      return  res.send('No Orders to Show')
    }

    res.render('adminOrderManagement',{orders:orders})

adminRoute.post('/order/updatestatus/:id',async(req,res)=>{
    const {id} = req.params
    const {status} = req.body
    
    try{
     await Order.findByIdAndUpdate(id,{status:status})
     res.send('Order Updated')

    }catch(error){
        console.log(error)
        res.status(500).send('An error Occurred')


    }

})

    

}catch(error){
    console.log(error)
    res.status(500).send('Internal Error')
}

})

adminRoute.get('/admin/add/user/',Auth,(req,res)=>{

})

adminRoute.post('/admin/add/User',Auth,async (req,res)=>{
    const {name,email,password,role} = req.body
    if(!name||!email|| !password){
        res.status(400).send('Missing Credentials')
    }
    const hashedPasword = await bcrypt.hash(password,8)
    const newUser = new User({
        name:name,
        email:email,
        password:hashedPasword,
        role:role
    })

   await newUser.save()


})

adminRoute.get('/admin/delete/user/:id',Auth, async (req,res)=>{
      const {id} = req.params
      try{
       User.findByIdAndDelete(id)
      res.status(200).json({message:'User removed Successfully'})
      }catch(error){
        res.status(500).json({message:'Internal Server Error'})
      }

})

adminRoute.post('/admin/edituser/details/:id',Auth,async (req,res)=>{
    const {id} = req.params
    const {name,email,password,role} = req.body
    try{
    const findUser = await User.findByIdAndUpdate(id,{
        name:name,
        email:email,
        password:password,
        role:role
    })

    await findUser.save()}catch(err){
        res.status(500).send('An Internal Server Error')
    }
})

adminRoute.post('/admin/logout',(req,res)=>{
   try{
   const token = req.cookies.token
   if(!token){
    res.status(401).send('Unauthorized Access')
   }{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    req.user =decoded
    res.clearCookie('token',{httpOnly:true,sameSite:strict, secure:true})
    res.redirect('/admin/login')
   }}catch(error){
    res.status(500).json({message:'Internal server error'})
   }

})

module.exports = adminRoute