import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <CartProvider>
      <Toaster position="top-right" />
      <App />
    </CartProvider>
  </AuthProvider>
);
