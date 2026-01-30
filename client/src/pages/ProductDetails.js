import React, {useEffect, useState} from 'react';
import API from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewSection from '../components/ReviewSection';

export default function ProductDetails(){
  const {id} = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  useEffect(()=>{ API.get('/products/'+id).then(r=>setProduct(r.data)).catch(e=>console.error(e)); },[id]);

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token) {
      return navigate('/login');
    }
    
    // Check if user is admin
    if (user && user.isAdmin) {
      alert('Admin users cannot add products to cart.');
      return;
    }
    
    try {
      await API.post('/cart/add', {productId: id, qty: 1}, { 
        headers: { Authorization: 'Bearer ' + token } 
      });
      alert('Added to cart');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  if(!product) return <div>Loading...</div>;
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <img src={product.image} alt="" className="w-full h-80 object-contain" />
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.round(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-gray-600 text-sm">
              ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="text-2xl font-semibold mb-4">₹{product.price.toFixed(0)}</div>
          <button 
            onClick={addToCart} 
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
          >
            Add to cart
          </button>
        </div>
      </div>
      
      {/* Reviews Section */}
      <ReviewSection productId={product._id} />
    </div>
  );
}