import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/customer/cartAPI';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart,    setCart]    = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [] });
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const add    = async (produceId, qty = 1) => { const d = await addToCart(produceId, qty);      setCart(d); };
  const update = async (produceId, qty)     => { const d = await updateCartItem(produceId, qty);  setCart(d); };
  const remove = async (produceId)          => { const d = await removeFromCart(produceId);       setCart(d); };
  const clear  = async ()                   => { await clearCart(); setCart({ items: [] }); };

  const itemCount   = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const totalAmount = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  const cartProduceNames = cart.items?.map(i => i.name.toLowerCase()) || [];

  return (
    <CartContext.Provider value={{ cart, loading, add, update, remove, clear, itemCount, totalAmount, fetchCart, cartProduceNames }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);