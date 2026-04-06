import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../api/orderAPI';
import styles from './OrdersPage.module.css';

const STATUS_LABEL = {
  pending:          { label: 'Pending',          color: '#e6a800' },
  confirmed:        { label: 'Confirmed',        color: '#357a27' },
  out_for_delivery: { label: 'Out for delivery', color: '#2980b9' },
  delivered:        { label: 'Delivered',        color: '#357a27' },
  cancelled:        { label: 'Cancelled',        color: '#c0392b' },
};

const POLL_INTERVAL_MS = 30_000; // refresh list every 30 seconds

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () =>
    getMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchOrders();

    // Poll so the list always reflects the latest statuses
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className={styles.loading}>Loading orders...</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My orders</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className={styles.shopBtn}>Start shopping</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => {
            const st    = STATUS_LABEL[order.status] || { label: order.status, color: '#888' };
            const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
            return (
              <Link to={`/orders/${order._id}`} key={order._id} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div>
                    <p className={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={styles.statusBadge}
                    style={{ color: st.color, background: `${st.color}18` }}>
                    {st.label}
                  </span>
                </div>

                <div className={styles.orderItems}>
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className={styles.orderItem}>
                      <div className={styles.itemImgWrap}>
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} className={styles.itemImg} />
                          : <span className={styles.itemPlaceholder}>🌿</span>}
                      </div>
                      <span className={styles.itemLabel}>{item.name} × {item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className={styles.more}>+{order.items.length - 3} more</span>
                  )}
                </div>

                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>₹{total.toFixed(2)}</span>
                  <span className={styles.viewLink}>View details →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}