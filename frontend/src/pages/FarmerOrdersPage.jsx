import { useEffect, useState } from 'react';
import { getFarmerOrders, updateOrderStatus } from '../api/orderAPI';
import toast from 'react-hot-toast';

const STATUS_LABEL = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

const STATUS_COLOR = {
  pending:          '#f59e0b',
  confirmed:        '#3b82f6',
  out_for_delivery: '#8b5cf6',
  delivered:        '#22c55e',
  cancelled:        '#ef4444',
};

const NEXT_STATUS = {
  pending:          'confirmed',
  confirmed:        'out_for_delivery',
  out_for_delivery: 'delivered',
};

const NEXT_LABEL = {
  pending:          'Confirm Order',
  confirmed:        'Mark Out for Delivery',
  out_for_delivery: 'Mark Delivered',
};

const TABS = ['all', 'active', 'past'];
const TAB_LABEL = { all: 'All Orders', active: 'Active', past: 'Past' };

export default function FarmerOrdersPage() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const [tab,      setTab]      = useState('all');

  const fetchOrders = async () => {
    try {
      const data = await getFarmerOrders();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      toast.success(`Order marked as ${STATUS_LABEL[updated.status]}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter(o => {
    if (tab === 'active') return !['delivered', 'cancelled'].includes(o.status);
    if (tab === 'past')   return  ['delivered', 'cancelled'].includes(o.status);
    return true;
  });

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div className="section-title">My Orders</div>
        <div style={{ fontSize: '12px', color: 'var(--br)' }}>
          {orders.length} total order{orders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 18px',
              borderRadius: '99px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: tab === t ? 'var(--g600)' : 'var(--g50)',
              color: tab === t ? '#fff' : 'var(--soil)',
              transition: 'all 0.15s',
            }}
          >
            {TAB_LABEL[t]}
            {t === 'active' && orders.filter(o => !['delivered','cancelled'].includes(o.status)).length > 0 && (
              <span style={{
                marginLeft: '6px', background: '#f59e0b', color: '#fff',
                borderRadius: '99px', padding: '1px 7px', fontSize: '11px',
              }}>
                {orders.filter(o => !['delivered','cancelled'].includes(o.status)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--br)', fontSize: '13px' }}>
          Loading orders...
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', color: 'var(--br)', fontSize: '13px',
          padding: '60px 0', background: '#fff',
          borderRadius: '14px', border: '1px solid var(--g100)',
        }}>
          {tab === 'all' ? 'No orders yet' : `No ${tab} orders`}
        </div>
      )}

      {/* Order Cards */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(order => (
            <div
              key={order._id}
              style={{
                background: '#fff',
                borderRadius: '14px',
                border: '1px solid var(--g100)',
                padding: '18px 22px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--soil)' }}>
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '99px',
                    background: STATUS_COLOR[order.status] + '20',
                    color: STATUS_COLOR[order.status], fontWeight: 700,
                  }}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--br)' }}>{formatDate(order.createdAt)}</span>
              </div>

              {/* Customer info */}
              <div style={{ fontSize: '12px', color: 'var(--br)', marginBottom: '10px' }}>
                👤 {order.customer?.name || 'Customer'}
                {order.customer?.phone && <span style={{ marginLeft: '10px' }}>📞 {order.customer.phone}</span>}
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {order.items.map((item, i) => (
                  <span key={i} style={{
                    fontSize: '12px', background: 'var(--g50)',
                    borderRadius: '8px', padding: '4px 10px', color: 'var(--soil)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} style={{ width: 18, height: 18, borderRadius: '4px', objectFit: 'cover' }} />
                      : <span>🌿</span>}
                    {item.name} × {item.quantity} {item.unit}
                  </span>
                ))}
              </div>

              {/* Delivery address */}
              {order.deliveryAddress?.street && (
                <div style={{ fontSize: '11px', color: 'var(--br)', marginBottom: '10px' }}>
                  📍 {order.deliveryAddress.street}, {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
                </div>
              )}

              {/* Bottom row: total + action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g600)' }}>
                  ₹{order.totalAmount.toLocaleString()}
                  <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--br)', marginLeft: '8px' }}>
                    {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online'}
                  </span>
                </div>

                {NEXT_STATUS[order.status] && (
                  <button
                    disabled={updating === order._id}
                    onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])}
                    style={{
                      fontSize: '12px', padding: '8px 16px',
                      borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: 'var(--g600)', color: '#fff', fontWeight: 600,
                      opacity: updating === order._id ? 0.6 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {updating === order._id ? 'Updating...' : NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
