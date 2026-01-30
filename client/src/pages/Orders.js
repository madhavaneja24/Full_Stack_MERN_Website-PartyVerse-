import React, {useEffect, useState} from 'react';
import API from '../api';

export default function Orders(){
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(()=>{ if(token){ API.get('/orders/my', { headers: { Authorization: 'Bearer '+token }}).then(r=>setOrders(r.data)).catch(e=>console.error(e)); } },[]);

  if(!token) return <div className="p-6 bg-white rounded">Please login to view your orders</div>;

  return (
    <div className="w-full mx-auto" style={{maxWidth: '800px'}}>
      <h2 className="text-xl font-semibold mb-4">My Orders</h2>
      <div className="grid gap-4">
        {orders.length===0 && <div>No orders yet</div>}
        {orders.map(o=>(
          <div key={o._id} className="bg-white rounded shadow p-6">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Order #{o._id}</div>
                <div className="text-sm text-gray-500">Placed: {new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{o.totalAmount.toFixed(0)}</div>
                <div className="text-sm">{o.status}</div>
                <div className="text-xs text-gray-500">{o.paymentMethod === 'PAYPAL' ? 'Paid Online' : 'Cash on Delivery'}</div>
              </div>
            </div>
            <div className="mt-3">
              <strong>Items:</strong>
              <ul className="mt-2">
                {o.items.map(it=>(
                  <li key={it.product} className="flex justify-between">
                    <span>{it.name} x {it.qty}</span>
                    <span>₹{it.price.toFixed(0)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <strong>Shipping:</strong> {o.shipping?.name}, {o.shipping?.address}, {o.shipping?.city} - {o.shipping?.postalCode}
            </div>
            {o.paymentMethod === 'PAYPAL' && o.paypal?.paymentId && (
              <div className="mt-2 text-sm text-green-600">
                <strong>Payment ID:</strong> {o.paypal.paymentId}
                {o.paypal.payerEmail && <div><strong>Payer:</strong> {o.paypal.payerEmail}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}