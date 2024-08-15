const express = require('express')
const productRoute =  express.Router()
const mongoose = require('mongoose')
const Product = require('./productModel')
const Order = require('./OrderModel')
const Checkout = require('../users/checkoutModel')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const Cart = require('./CartModel')
const User = require('../users/userModel')

productRoute.use(cookieParser());

const Auth = (req,res,next)=>{
  const token = req.cookies.token
    
    if(!token){
      return res.redirect('/login')
    }
  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    req.user = decoded
    req.session.userId = req.user.id
    next()
  
  }catch(error){
      res.redirect('/login')
    }
    
}

productRoute.get('/products',Auth, async(req,res)=>{
  
    
    
    try{
    const products = await Product.find()

    res.json({products})}catch(error){
res.redirect('/login')
    }
     })
        
  
productRoute.get('/products/post',(req,res)=>{
    const productList = new Product({
        name:'Apple Laptop',
        description:'A very nice mac Book pro for with quality camera pixels and high Processor Speed',
        price:1300
    })

    productList.save()
       .then(()=>res.send('Successfully saved'))
       .catch((err)=>console.log(err))
})
productRoute.get('/Products/details/:id', Auth, async (req,res)=>{
    
    const{id}=req.params
    try{
    const product= await Product.findById(id) 
    if(!product){
        res.send('product not available')
    }else{
    res.json({product:product})}
  }catch(error){
    res.status(404).send('Oops could not get the product')
  }
})

productRoute.post('/add/tocart',Auth,async (req,res)=>{
  const {productId}= req.body
  const userId = req.session.userId

  try{
    console.log(userId)
    console.log(productId)
    const item = await Product.findById(productId)
    const productName = item.name
    const productPrice = item.price
    const productImage = item.image
    
  let cart = await Cart.findOne({userId})
  if(!cart){
    console.log('Could not find Cart,About to create one');
    try{
    const cart = new Cart({userId,

      items:[{productId,productName,productPrice,productImage}]})
      await cart.save()
    
    }catch(error){
        console.log(error)
      }

   
    console.log('Cart Created Successfully')
    
  }else{
    console.log('Cart Already Exists')
  const itemIndex = cart.items.findIndex(item=>item.productId===productId)
  console.log(itemIndex)
  
  if(itemIndex>-1){
    cart.items[itemIndex].quantity+=1
    cart.items[itemIndex].productPrice =+productPrice
    console.log(cart.items[itemIndex].quantity)
     await cart.save()
    
  }else{
    cart.items.push({productId,productName,productPrice,productImage})
    console.log('Item has been pushed')
  }}
  await cart.save()
  res.status(200).send(cart)
  console.log('Cart has been Saved')

}catch(error){
    res.status(500).send('Something went wrong')
  }
})

productRoute.get('/cart',Auth, async(req,res)=>{
  const userId = req.session.userId
  try{
    const cart = await Cart.findOne({userId})
    console.log( cart);
    if(cart){
      const cartItems = cart.items
      return res.json({cartItems:cartItems})
    }
    else{
     return res.status(404).json({message:'You have Cart Items'})
    }


  }catch(err){
      res.status(500).json({message:"Could not Load Cart"})
  }


})

productRoute.get('/cart/item/remove/:id',async (req,res)=>{
  const{id}= req.params
  const userId = req.session.userId
  try{
  let cart = await Cart.findOne({userId})
  const itemToDelete = cart.items.findIndex(item=>item.productId===id)
  console.log('item found about to delete')
  cart.items.splice(itemToDelete,1)
  console.log('Item removed')
  await cart.save()
   res.json({message: 'Item removed Successfully'})
  


  }catch(error){
    res.send('Internal error')
    console.error(error)
  }




})
productRoute.get('/orders',Auth,async(req,res)=>{
  const userId = req.session.userId;
  try {
    const orders = await Order.find({ userId: userId }).populate('items');
    console.log(orders);
    if (!orders || orders.length === 0) {
      return res.json({message:'You have no orders yet'});
    }
    res.json({ orders: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({message:'An error occurred while fetching your orders'});
  }
})

productRoute.get('/checkout/confirm',Auth,(req,res)=>{
  res.render('Checkout')
})

productRoute.post('/checkout/confirm',async(req,res)=>{
      const userId = req.session.userId
  try{
    const newCheckoutInfo = new Checkout(req.body)

  await newCheckoutInfo.save()
  await Cart.findOneAndDelete({userId})
  
  res.redirect('/orders')
  }catch(error){
    console.log(error)
    res.status(500).json({message:'Failed to Checkout'})
  }
  
})

productRoute.get('/confirm/order',Auth,async(req,res)=>{
  
  const userId = req.session.userId
  try{
  const user =await User.findById(userId)
  if (!user) {
    return res.status(404).json({message:'Cart not found'});}
  const cart = await Cart.findOne({userId}).populate('items.productId')

  console.log('Cart populated:', cart);

  

  const items = cart.items.map(item=>({
    productId:item.productId,
    productName: item.productName,
    productImage:item.productImage,
    productPrice: item.productPrice,
    quantity:item.quantity
  }))
  console.log('able to find all info')

  const order = new Order({
    userId,
    name:user.name,
    items:items,
    status:'Pending'
  })
  await order.save()
  res.redirect('/checkout/confirm')
}catch(error){
    console.error(error)
    res.status(500).send('Internal error')
  }
})


module.exports = productRoute