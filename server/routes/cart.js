const router = require('express').Router();
const auth = require('../middlewares/auth');
const Cart = require('../models/Cart');

router.get('/', auth, async (req,res)=>{
  let cart = await Cart.findOne({user:req.user.id}).populate('items.product');
  if(!cart) cart = await new Cart({user:req.user.id, items:[]}).save();
  // remove null product entries (product deleted)
  cart.items = cart.items.filter(i => i.product);
  await cart.save();
  cart = await cart.populate('items.product');
  res.json(cart);
});

router.post('/add', auth, async (req,res)=>{
  const {productId, qty} = req.body;
  let cart = await Cart.findOne({user:req.user.id});
  if(!cart) cart = new Cart({user:req.user.id, items:[]});
  const idx = cart.items.findIndex(i=>i.product.toString() === productId);
  if(idx>-1){
    cart.items[idx].qty = qty;
    if(qty<=0) cart.items.splice(idx,1);
  } else {
    cart.items.push({product: productId, qty});
  }
  await cart.save();
  cart = await cart.populate('items.product');
  res.json(cart);
});

module.exports = router;