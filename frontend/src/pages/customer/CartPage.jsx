import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { cart, update, remove, totalAmount, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className={styles.loading}>Loading cart...</div>;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Your cart is empty</p>
        <Link to="/" className={styles.shopBtn}>Browse produce</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your cart</h1>
      <div className={styles.layout}>

        {/* Items */}
        <div className={styles.items}>
          {cart.items.map((item) => (
            <div key={item.produce} className={styles.item}>
              <div className={styles.imgWrap}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className={styles.img} />
                ) : (
                  <div className={styles.imgPlaceholder}>🌿</div>
                )}
              </div>
              <div className={styles.itemBody}>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemPrice}>₹{item.price}/{item.unit}</p>
                {item.farmerName && (
                  <p className={styles.itemFarmer}>🌾 {item.farmerName}</p>
                )}
              </div>
              <div className={styles.qtyControl}>
                <button className={styles.qtyBtn}
                  onClick={() => update(item.produce, item.quantity - 1)}
                  disabled={item.quantity <= 1}>−</button>
                <span className={styles.qtyVal}>{item.quantity}</span>
                <button className={styles.qtyBtn}
                  onClick={() => update(item.produce, item.quantity + 1)}>+</button>
              </div>
              <div className={styles.itemTotal}>₹{item.price * item.quantity}</div>
              <button className={styles.removeBtn}
                onClick={() => remove(item.produce)} title="Remove">✕</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery</span>
            <span className={styles.free}>Free</span>
          </div>
          <hr className={styles.hr} />
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Total</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
            Proceed to checkout →
          </button>
          <Link to="/" className={styles.continueLink}>← Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
