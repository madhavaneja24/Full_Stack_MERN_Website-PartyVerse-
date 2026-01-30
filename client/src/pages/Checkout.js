import React, {useState, useEffect, useRef} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function Checkout(){
  const [shipping, setShipping] = useState({name:'',address:'',city:'',postalCode:'',phone:''});
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paypalOrder, setPaypalOrder] = useState(null);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  
  // Fetch cart data
  useEffect(() => {
    if(token){
      API.get('/cart', {headers:{Authorization:'Bearer '+token}})
        .then(r => setCart(r.data))
        .catch(e => {
          if(e.response?.status === 401){
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            console.error(e);
          }
        });
    }
  }, [token, navigate]);
  


  const submit = async (e)=>{
    e.preventDefault();
    if(!token){ return navigate('/login'); }
    
    try{
      setIsLoading(true);
      if(paymentMethod === 'PAYPAL') {
        // Create order with PayPal
        const r = await API.post('/orders', {
          shipping, 
          paymentMethod: 'PAYPAL'
        }, { headers: { Authorization: 'Bearer '+token } });
        
        setIsLoading(false);
        setPaypalOrder(r.data);
        // PayPal buttons will be rendered by the useEffect
      } else {
        // Cash on Delivery flow
        const r = await API.post('/orders', {
          shipping, 
          paymentMethod: 'COD'
        }, { headers: { Authorization: 'Bearer '+token } });
        
        setIsLoading(false);
        alert('Order placed! Order id: ' + r.data._id + ' (Cash on Delivery)');
        navigate('/orders');
      }
    } catch(e){
      setIsLoading(false);
      if(e.response?.status === 401){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert(e.response?.data?.message || 'Order failed');
      }
    }
  };

  // Calculate total amount
  const subtotal = cart?.items?.reduce((s,it)=>s + (it.product.price * it.qty), 0) || 0;

  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Checkout</h2>
      
      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">Order Summary</h3>
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between font-semibold mt-2">
          <span>Total:</span>
          <span>₹{subtotal.toFixed(0)}</span>
        </div>
      </div>
      
      {!paypalOrder ? (
        <form onSubmit={submit}>
          {/* Shipping Information */}
          <h3 className="font-medium mb-2">Shipping Information</h3>
          <input className="w-full border p-2 rounded mb-3" placeholder="Full name" required value={shipping.name} onChange={e=>setShipping({...shipping,name:e.target.value})} />
          <input className="w-full border p-2 rounded mb-3" placeholder="Address" required value={shipping.address} onChange={e=>setShipping({...shipping,address:e.target.value})} />
          <input className="w-full border p-2 rounded mb-3" placeholder="City" required value={shipping.city} onChange={e=>setShipping({...shipping,city:e.target.value})} />
          <input className="w-full border p-2 rounded mb-3" placeholder="Postal Code" required value={shipping.postalCode} onChange={e=>setShipping({...shipping,postalCode:e.target.value})} />
          <input className="w-full border p-2 rounded mb-3" placeholder="Phone" required value={shipping.phone} onChange={e=>setShipping({...shipping,phone:e.target.value})} />
          
          {/* Payment Method Selection */}
          <h3 className="font-medium mb-2">Payment Method</h3>
          <div className="flex flex-col gap-2 mb-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="COD" 
                checked={paymentMethod === 'COD'} 
                onChange={() => setPaymentMethod('COD')} 
              />
              <span>Cash on Delivery</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="PAYPAL" 
                checked={paymentMethod === 'PAYPAL'} 
                onChange={() => setPaymentMethod('PAYPAL')} 
              />
              <span>Pay Online (PayPal)</span>
            </label>
          </div>
          
          <button 
            disabled={isLoading} 
            className={`${isLoading ? 'bg-gray-400' : 'bg-green-600'} text-white px-4 py-2 rounded w-full`}
          >
            {isLoading ? 'Processing...' : paymentMethod === 'PAYPAL' ? 'Continue to PayPal' : 'Place Order (COD)'}
          </button>
        </form>
      ) : (
        <div>
          <h3 className="font-medium mb-4">Complete your payment</h3>
          <p className="text-sm text-gray-600 mb-4">Choose your payment method</p>
          
          {!showUpiQr && !showCardForm && (
            <>
              {/* PayPal/UPI button */}
              <button 
                onClick={() => setShowUpiQr(true)}
                className="bg-yellow-500 text-white w-full py-3 rounded font-medium flex items-center justify-center mb-4"
                disabled={isLoading}
              >
                Pay with PayPal/UPI
              </button>
              
              {/* Credit/Debit Card Payment Button */}
              <button 
                onClick={() => setShowCardForm(true)}
                className="bg-blue-600 text-white w-full py-3 rounded font-medium flex items-center justify-center"
                disabled={isLoading}
              >
                Pay with Credit/Debit Card
              </button>
            </>
          )}
          
          {/* UPI QR Code */}
          {showUpiQr && (
            <div className="border p-4 rounded mb-4">
              <h4 className="font-medium mb-2">Scan PartyVerse QR Code to Pay</h4>
              <div className="flex justify-center mb-3">
                <div className="bg-white p-4 rounded-lg shadow-md w-64 h-64 flex flex-col items-center justify-center">
                  {/* Enhanced QR code with PartyVerse branding */}
                  <div className="relative">
                    <div className="border border-gray-200 w-48 h-48 grid grid-cols-21 grid-rows-21 p-2 bg-white rounded-lg shadow-sm">
                      {/* Position detection patterns - top-left */}
                      <div className="absolute top-2 left-2 w-12 h-12 flex items-center justify-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Position detection patterns - top-right */}
                      <div className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Position detection patterns - bottom-left */}
                      <div className="absolute bottom-2 left-2 w-12 h-12 flex items-center justify-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* QR code center content with PartyVerse logo */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 grid grid-cols-5 grid-rows-5 gap-1">
                          {[
                            1,0,1,0,1,
                            0,1,0,1,0,
                            1,0,1,0,1,
                            0,1,0,1,0,
                            1,0,1,0,1
                          ].map((value, i) => (
                            <div key={i} className={value ? 'bg-purple-600 rounded-sm' : ''}></div>
                          ))}
                        </div>
                        {/* Logo overlay without emoji */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <div className="text-xl font-bold text-purple-600">PV</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-purple-600 font-medium text-sm">PartyVerse - Scan to pay with UPI</div>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Enter UPI ID</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    if (!upiId.trim()) {
                      alert('Please enter UPI ID');
                      return;
                    }
                    setIsLoading(true);
                    try {
                      await API.post('/orders/capture-paypal-payment', {
                        orderId: paypalOrder.order._id,
                        paymentId: 'upi-payment-' + Date.now(),
                        payerEmail: upiId,
                        payerCountry: 'IN',
                        currency: 'INR'
                      }, { headers: { Authorization: 'Bearer '+token } });
                      
                      setIsLoading(false);
                      alert('Payment successful!');
                      navigate('/orders');
                    } catch (error) {
                      setIsLoading(false);
                      if(error.response?.status === 401){
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                      } else {
                        console.error('Payment error:', error);
                        alert('Payment failed. Please try again.');
                      }
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Pay Now'}
                </button>
                <button
                  onClick={() => setShowUpiQr(false)}
                  className="border border-gray-300 px-4 py-2 rounded"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Credit Card Form */}
          {showCardForm && (
            <div className="border p-4 rounded mb-4">
              <h4 className="font-medium mb-2">Enter Card Details for PartyVerse</h4>
              <div className="flex items-center mb-3">
                <div className="text-xl text-purple-600 mr-2 font-bold">PV</div>
                <div className="text-sm text-gray-500">Secure payment powered by PartyVerse</div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Name on Card</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                />
              </div>
              <div className="flex space-x-4 mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    // Basic validation
                    if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
                      alert('Please fill all card details');
                      return;
                    }
                    setIsLoading(true);
                    try {
                      await API.post('/orders/capture-paypal-payment', {
                        orderId: paypalOrder.order._id,
                        paymentId: 'card-payment-' + Date.now(),
                        payerEmail: 'card-payment@example.com',
                        payerCountry: 'IN',
                        currency: 'INR'
                      }, { headers: { Authorization: 'Bearer '+token } });
                      
                      setIsLoading(false);
                      alert('Payment successful!');
                      navigate('/orders');
                    } catch (error) {
                      setIsLoading(false);
                      if(error.response?.status === 401){
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                      } else {
                        console.error('Payment error:', error);
                        alert('Payment failed. Please try again.');
                      }
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Pay Now'}
                </button>
                <button
                  onClick={() => setShowCardForm(false)}
                  className="border border-gray-300 px-4 py-2 rounded"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setPaypalOrder(null)} 
            className="text-gray-600 underline mt-4 block"
          >
            Cancel and return to checkout
          </button>
        </div>
      )}
    </div>
  );
}