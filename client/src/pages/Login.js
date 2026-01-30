import React, {useState} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
export default function Login({onLogin}){
  const [email,setEmail]=useState(''), [password,setPassword]=useState('');
  const navigate = useNavigate();
  const submit = async (e)=>{ e.preventDefault();
    try{
      const r = await API.post('/auth/login',{email,password});
      localStorage.setItem('token', r.data.token);
      localStorage.setItem('user', JSON.stringify(r.data.user));
      onLogin && onLogin(r.data.user);
      navigate('/');
    }catch(e){ alert(e.response?.data?.message || 'Login failed'); }
  };
  return (
    <div className="max-w-xl w-full mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={submit}>
        <input className="w-full border p-2 rounded mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded mb-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-pink-500 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  );
}