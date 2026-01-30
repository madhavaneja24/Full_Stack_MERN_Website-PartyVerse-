const router = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middlewares/auth');

// Add a review to a product (requires authentication)
router.post('/:productId', auth, async (req, res) => {
  try {
    console.log('Review submission received:', {
      productId: req.params.productId,
      user: req.user,
      body: req.body
    });

    const { rating, comment } = req.body;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      console.log('Invalid rating:', rating);
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }
    
    // Check if product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      console.log('Product not found:', req.params.productId);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user has already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user && r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      console.log('User already reviewed this product');
      return res.status(400).json({ 
        message: 'You have already reviewed this product',
        reviewId: alreadyReviewed._id
      });
    }

    // Create review object
    const review = {
      user: req.user._id,
      name: req.user.name || 'Anonymous',
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    };

    console.log('Adding review:', review);

    // Add review to product
    product.reviews.push(review);
    
    // Update number of reviews and rating
    product.numReviews = product.reviews.length;
    const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);
    product.rating = totalRating / product.reviews.length;

    // Save the product with the new review
    await product.save();
    
    console.log('Review added successfully');
    
    // Return the saved review with populated user data
    const savedReview = product.reviews[product.reviews.length - 1];
    const populatedReview = {
      ...savedReview.toObject(),
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    };
    
    res.status(201).json({ 
      message: 'Review added successfully', 
      review: populatedReview 
    });
  } catch (error) {
    console.error('Error adding review:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user,
      params: req.params
    });
    res.status(500).json({ 
      message: 'Failed to add review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all reviews for a product (public endpoint)
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('reviews.user', 'name email')
      .select('reviews');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product.reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
