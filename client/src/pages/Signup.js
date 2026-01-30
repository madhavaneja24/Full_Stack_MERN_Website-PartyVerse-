import React, {useState} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function Signup({onSignup}){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const navigate = useNavigate();

  const submit = async (e) => { 
    e.preventDefault();
    try {
      const r = await API.post('/auth/signup', {
        name,
        email,
        password,
        isAdmin: userType === 'admin'
      });
      
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('user', JSON.stringify(r.data.user));
      onSignup && onSignup(r.data.user);
      
      // Redirect based on user type
      if (r.data.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch(e) { 
      alert(e.response?.data?.message || 'Signup failed'); 
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
          <input 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
            placeholder="Enter your name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
          <input 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
          <input 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
            type="password" 
            placeholder="Create a password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            minLength="6"
            required 
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">I want to</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-pink-600"
                name="userType"
                value="user"
                checked={userType === 'user'}
                onChange={() => setUserType('user')}
              />
              <span className="ml-2 text-gray-700">Shop as Customer</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-pink-600"
                name="userType"
                value="admin"
                checked={userType === 'admin'}
                onChange={() => setUserType('admin')}
              />
              <span className="ml-2 text-gray-700">Manage Products</span>
            </label>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
        >
          Create Account
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-pink-600 hover:underline">Sign in</a>
        </p>
      </form>
    </div>
  );
}