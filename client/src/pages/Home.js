import React, {useEffect, useState, useMemo} from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

export default function Home(){
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(()=>{ 
    API.get('/products').then(r=>setProducts(r.data)).catch(e=>console.error(e)); 
  },[]);
  
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.title.toLowerCase().includes(term) || 
      product.category.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);
  return (
    <div>
      <section className="bg-white rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold">Make every party special 🎉</h1>
          <p className="text-gray-600 mb-4">Decorations, tableware, hats, confetti and more — delivered fast.</p>
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <img src="/images/balloons.png" className="w-48 h-48 object-contain" alt="Party decorations"/>
        </div>
      </section>

      <h2 className="text-xl font-semibold mb-4">
        {searchTerm ? `Search results for "${searchTerm}"` : 'Featured'}
        {searchTerm && filteredProducts.length === 0 && <span className="text-gray-500 ml-2">No products found</span>}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map(p=>(
          <div key={p._id} className="bg-white rounded shadow p-4">
            <Link to={'/product/'+p._id}><img src={p.image} alt={p.title} className="h-48 w-full object-contain mb-3"/></Link>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.category}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">₹{p.price.toFixed(0)}</div>
                <Link to={'/product/'+p._id} className="mt-2 inline-block bg-pink-500 text-white px-3 py-1 rounded">View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}