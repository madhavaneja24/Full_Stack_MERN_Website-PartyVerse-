const router = require('express').Router();
const Product = require('../models/Product');

router.get('/', async (req,res)=>{
  const q = req.query.q;
  const filter = q ? { title: { $regex: q, $options: 'i' } } : {};
  const products = await Product.find(filter);
  res.json(products);
});

router.get('/:id', async (req,res)=>{
  const p = await Product.findById(req.params.id);
  if(!p) return res.status(404).json({message:'Not found'});
  res.json(p);
});

module.exports = router;