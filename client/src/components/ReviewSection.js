import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Star, StarFill, PersonCircle } from 'react-bootstrap-icons';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hover, setHover] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await API.get(`/reviews/${productId}`);
      setReviews(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      if (window.confirm('You need to be logged in to leave a review. Would you like to log in now?')) {
        navigate('/login', { state: { from: window.location.pathname } });
      }
      return;
    }

    if (!rating) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await API.post(
        `/reviews/${productId}`, 
        { rating, comment },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setComment('');
      setRating(0);
      await fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderReviewForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">Write a Review</h4>
      {!isAuthenticated ? (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">Please sign in to leave a review</p>
          <button
            onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="text-2xl focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  {star <= (hover || rating) ? (
                    <StarFill className="text-yellow-400" />
                  ) : (
                    <Star className="text-gray-300" />
                  )}
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {rating ? `${rating} star${rating > 1 ? 's' : ''}` : 'Rate this product'}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="review"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !rating || !comment.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  const renderReviewsList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Customer Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          )}
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center">
            <span className="text-yellow-400 text-xl mr-1">
              <StarFill className="inline" />
            </span>
            <span className="font-medium">
              {reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length}
              <span className="text-gray-500 text-sm ml-1">out of 5</span>
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="mr-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <PersonCircle size={24} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">
                        {review.user?.name || 'Anonymous'}
                      </span>
                      {review.user?.email && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({review.user.email.split('@')[0]})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1 sm:mt-0">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-yellow-400">
                            {star <= review.rating ? (
                              <StarFill className="w-5 h-5" />
                            ) : (
                              <Star className="w-5 h-5 text-gray-300" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.images.map((image, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={image} 
                            alt={`Review ${idx + 1}`} 
                            className="w-16 h-16 object-cover rounded border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                            onClick={() => window.open(image, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-12 max-w-4xl mx-auto">
      {renderReviewForm()}
      {renderReviewsList()}
    </div>
  );
};

export default ReviewSection;
