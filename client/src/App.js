import React, {useState} from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import AdminOrders from './pages/AdminOrders';
import Login from './pages/Login';
import Signup from './pages/Signup';

function Navbar({user, setUser}){
  const navigate = useNavigate();
  const logout = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); navigate('/'); }
  return (
    <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold">PartyVerse</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          {(!user || !user.isAdmin) && (
            <>
              <Link to="/cart" className="hover:underline">Cart</Link>
              <Link to="/orders" className="hover:underline">My Orders</Link>
            </>
          )}
          {user?.isAdmin && (
            <>
              <Link to="/admin" className="bg-white/20 px-3 py-1 rounded">Admin</Link>
              <Link to="/admin-orders" className="bg-white/20 px-3 py-1 rounded">Manage Orders</Link>
            </>
          )}
          {user ? (
            <>
              <span className="px-2">Hi, {user.name}</span>
              <button onClick={logout} className="bg-white text-pink-600 px-3 py-1 rounded">Logout</button>
            </>
          ):(
            <>
              <Link to="/login" className="bg-white text-pink-600 px-3 py-1 rounded">Login</Link>
              <Link to="/signup" className="bg-white text-pink-600 px-3 py-1 rounded">Signup</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App(){
  const [user, setUser] = useState(()=> {
    const s = localStorage.getItem('user'); return s? JSON.parse(s): null;
  });

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-orders" element={<AdminOrders />} />
          <Route path="/login" element={<Login onLogin={(u)=>{setUser(u);}} />} />
          <Route path="/signup" element={<Signup onSignup={(u)=>{setUser(u);}} />} />
        </Routes>
      </main>
      <footer className="text-center py-6 text-gray-600">© {new Date().getFullYear()} PartyVerse</footer>
    </div>
  );
}