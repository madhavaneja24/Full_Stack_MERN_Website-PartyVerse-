const router = require('express').Router();
const auth = require('../middlewares/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const axios = require('axios');

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

// Generate PayPal access token
async function generateAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios({
      url: `${PAYPAL_API}/v1/oauth2/token`,
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: 'grant_type=client_credentials'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to generate PayPal access token:', error);
    throw new Error('Failed to generate PayPal access token');
  }
}

router.post('/', auth, async (req,res)=>{
  try{
    const {shipping, paymentMethod} = req.body;
    const cart = await Cart.findOne({user:req.user.id}).populate('items.product');
    if(!cart || cart.items.length===0) return res.status(400).json({message:'Cart is empty'});
    const items = cart.items.map(i=>({
      product: i.product._id,
      name: i.product.title,
      price: i.product.price,
      qty: i.qty
    }));
    const total = items.reduce((s,it)=>s + (it.price * it.qty), 0);
    
    // Create order based on payment method
    if(paymentMethod === 'PAYPAL') {
      try {
        // Create order in our database first
        const order = new Order({
          user: req.user.id, 
          items, 
          totalAmount: total, 
          shipping, 
          paymentMethod: 'PAYPAL', 
          status: 'Pending'
        });
        await order.save();
        
        // Return order details for client-side PayPal integration
        return res.json({
          order,
          clientId: PAYPAL_CLIENT_ID
        });
      } catch (error) {
        console.error('PayPal order creation error:', error);
        return res.status(500).json({ message: 'Failed to create payment order. Please try again.' });
      }
    } else {
      // Default COD flow
      const order = new Order({user:req.user.id, items, totalAmount: total, shipping, paymentMethod:'COD', status:'Pending'});
      await order.save();
      cart.items = [];
      await cart.save();
      res.json(order);
    }
  }catch(e){ res.status(500).json({message:e.message}); }
});

router.get('/my', auth, async (req,res)=>{
  const orders = await Order.find({user:req.user.id}).sort({createdAt:-1});
  res.json(orders);
});

// Capture payment (PayPal or Credit Card)
router.post('/capture-paypal-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentId, payerEmail, payerCountry, currency } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Missing order ID' });
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    
    // Verify that the order belongs to the authenticated user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Update order with payment details
    order.paypal = {
      paymentId: paymentId || 'payment-' + Date.now(),
      payerEmail: payerEmail || 'customer@example.com',
      payerCountry: payerCountry || 'IN',
      currency: currency || 'INR',
      paymentStatus: 'COMPLETED'
    };
    order.status = 'Paid';
    await order.save();
    
    // Clear cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    return res.json({ success: true, order });
  } catch (e) {
    console.error('PayPal payment capture error:', e);
    res.status(500).json({ message: 'Payment capture failed' });
  }
});

module.exports = router;