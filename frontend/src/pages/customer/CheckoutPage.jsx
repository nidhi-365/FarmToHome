import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeOrder } from '../../api/customer/orderAPI';
import toast from 'react-hot-toast';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const { cart, totalAmount, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || 'Bengaluru',
    state:   user?.address?.state   || 'Karnataka',
    pincode: user?.address?.pincode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handleChange = (e) =>
    setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.street || !address.pincode) {
      toast.error('Please fill in your full delivery address');
      return;
    }
    setPlacing(true);
    try {
      const order = await placeOrder({ deliveryAddress: address, paymentMethod });
      await clear();
      toast.success('Order placed! 🌿');
      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>
      <div className={styles.layout}>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.formCard}>
          <h2 className={styles.sectionHead}>Delivery address</h2>
          <div className={styles.field}>
            <label className={styles.label}>Street address</label>
            <input name="street" className={styles.input}
              placeholder="12, MG Road, Indiranagar"
              value={address.street} onChange={handleChange} required />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>City</label>
              <input name="city" className={styles.input} value={address.city} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>State</label>
              <input name="state" className={styles.input} value={address.state} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Pincode</label>
              <input name="pincode" className={styles.input} placeholder="560001"
                value={address.pincode} onChange={handleChange} required />
            </div>
          </div>

          <h2 className={styles.sectionHead} style={{ marginTop: 28 }}>Payment</h2>
          <div className={styles.payOptions}>
            <label className={`${styles.payOption} ${paymentMethod === 'cod' ? styles.payActive : ''}`}>
              <input type="radio" name="payment" value="cod"
                checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              💵 Cash on delivery
            </label>
            <label className={`${styles.payOption} ${paymentMethod === 'online' ? styles.payActive : ''}`}>
              <input type="radio" name="payment" value="online"
                checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
              💳 Online payment
            </label>
          </div>

          <button type="submit" className={styles.placeBtn} disabled={placing}>
            {placing ? 'Placing order...' : `Place order — ₹${totalAmount.toFixed(2)}`}
          </button>
        </form>

        {/* Summary */}
        <div className={styles.summary}>
          <h2 className={styles.sectionHead}>Order summary</h2>
          <div className={styles.itemList}>
            {cart.items.map((item) => (
              <div key={item.produce} className={styles.summaryItem}>
                <div className={styles.summaryImgWrap}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className={styles.summaryImg} />
                    : <span>🌿</span>}
                </div>
                <div className={styles.summaryItemBody}>
                  <span className={styles.summaryName}>{item.name} × {item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>
                  {item.farmerName && (
                    <span className={styles.summaryFarmer}>{item.farmerName}</span>
                  )}
                </div>
                <span className={styles.summaryPrice}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <hr className={styles.hr} />
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
