import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../../api/orderAPI';
import { toast } from 'react-toastify';
import styles from './OrderDetailPage.module.css';

const STATUS_STEPS = ['pending', 'confirmed', 'out_for_delivery', 'delivered'];
const STATUS_LABEL = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  out_for_delivery: 'Out for delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const prevStatusRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    getOrderById(id)
      .then((data) => {
        setOrder(data);
        prevStatusRef.current = data.status;
      })
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // SSE — live status stream
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // EventSource doesn't support custom headers; pass token as query param
    const url = `/api/orders/${id}/live?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const { status, deliveredAt } = JSON.parse(event.data);
        setOrder((prev) => {
          if (!prev) return prev;
          // Toast only when status actually changes, not on the initial sync
          if (prevStatusRef.current && status !== prevStatusRef.current) {
            toast.info(`Order status updated: ${STATUS_LABEL[status] ?? status}`);
          }
          prevStatusRef.current = status;
          return { ...prev, status, deliveredAt };
        });
      } catch (_) { /* ignore malformed messages */ }
    };

    es.onerror = () => {
      // Browser auto-reconnects; nothing to do here
    };

    return () => es.close();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(id);
      setOrder(updated);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!order)  return <div className={styles.loading}>Order not found.</div>;

  const total     = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/orders')}>← My orders</button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className={styles.date}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        {order.status === 'pending' && (
          <button className={styles.cancelBtn} onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Cancel order'}
          </button>
        )}
      </div>

      {/* Status tracker */}
      {order.status !== 'cancelled' ? (
        <div className={styles.tracker}>
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className={styles.trackStep}>
              <div className={`${styles.trackDot} ${i <= stepIndex ? styles.trackDotActive : ''}`} />
              <p className={`${styles.trackLabel} ${i <= stepIndex ? styles.trackLabelActive : ''}`}>
                {STATUS_LABEL[step]}
              </p>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`${styles.trackLine} ${i < stepIndex ? styles.trackLineActive : ''}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.cancelledBanner}>Order was cancelled</div>
      )}

      <div className={styles.layout}>
        {/* Items */}
        <div className={styles.itemsCard}>
          <h2 className={styles.cardTitle}>Items</h2>
          {order.items.map((item, i) => (
            <div key={i} className={styles.item}>
              <div className={styles.imgWrap}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className={styles.img} />
                  : <span className={styles.imgPlaceholder}>🌿</span>}
              </div>
              <div className={styles.itemBody}>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemFarm}>{item.farmerName}</p>
              </div>
              <div className={styles.itemRight}>
                <p className={styles.itemQty}>{item.quantity} {item.unit}</p>
                <p className={styles.itemPrice}>₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
          <hr className={styles.hr} />
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Address + payment */}
        <div>
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>Delivery address</h2>
            <p className={styles.infoLine}>{order.deliveryAddress?.street}</p>
            <p className={styles.infoLine}>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} — {order.deliveryAddress?.pincode}
            </p>
          </div>
          <div className={styles.infoCard} style={{ marginTop: 16 }}>
            <h2 className={styles.cardTitle}>Payment</h2>
            <p className={styles.infoLine}>
              {order.paymentMethod === 'cod' ? '💵 Cash on delivery' : '💳 Online payment'}
            </p>
            <p className={styles.infoLine}
              style={{ color: order.paymentStatus === 'paid' ? 'var(--g500)' : 'var(--warning)' }}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}