const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
  items:[{ product:{type:mongoose.Schema.Types.ObjectId, ref:'Product'}, name:String, price:Number, qty:Number }],
  totalAmount:Number,
  shipping:{ name:String, address:String, city:String, postalCode:String, phone:String },
  paymentMethod:{type:String, default:'COD'},
  status:{type:String, default:'Pending'},
  paypal: {
    orderId: String,
    paymentId: String,
    payerEmail: String,
    payerCountry: String,
    currency: String,
    paymentStatus: String
  }
},{timestamps:true});
module.exports = mongoose.model('Order', OrderSchema);