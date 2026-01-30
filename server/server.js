const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the_party_shop';
mongoose.connect(MONGODB_URI).then(()=>console.log('MongoDB connected')).catch(e=>console.error(e));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin/products', require('./routes/adminProducts'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin/orders', require('./routes/adminOrders'));
app.use('/api/reviews', require('./routes/reviews'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log('Server running on port', PORT));