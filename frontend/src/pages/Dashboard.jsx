import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ icon, label, value, sub }) => (
  <div className="stat-card">
    <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div style={{ fontSize: '11px', color: 'var(--g400)', marginTop: '4px' }}>{sub}</div>}
  </div>
);

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

export default function Dashboard() {
  const [data,     setData]     = useState(null);
  const [orders,   setOrders]   = useState([]);
  const [updating, setUpdating] = useState(null);

  const fetchDashboard = () =>
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error);

  const fetchOrders = () =>
    api.get('/orders/farmer/incoming').then(r => setOrders(r.data)).catch(console.error);

  useEffect(() => {
    fetchDashboard();
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      await Promise.all([fetchDashboard(), fetchOrders()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (!data) return (
    <div style={{ color: 'var(--br)', fontSize: '13px', padding: '40px', textAlign: 'center' }}>
      Loading dashboard...
    </div>
  );

  const chartData    = Object.entries(data.monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders   = orders.filter(o =>  ['delivered', 'cancelled'].includes(o.status));

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Farmer Dashboard</div>
        <div style={{ fontSize: '12px', color: 'var(--br)' }}>Your farm at a glance</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
        <StatCard icon="💰" label="Total Revenue"   value={`₹${data.totalRevenue.toLocaleString()}`} />
        <StatCard icon="🧺" label="Total Orders"    value={data.totalOrders} sub={`${data.pendingOrders} pending`} />
        <StatCard icon="🍂" label="Imperfect Sold"  value={`${data.imperfectSold} kg`} sub="Waste reduced" />
        <StatCard icon="📦" label="Active Listings" value={data.totalListings} />
      </div>

      <div className="divider" />

      <div style={{ marginBottom: '28px' }}>
        <div className="section-header" style={{ marginBottom: '14px' }}>
          <div className="section-title" style={{ fontSize: '14px' }}>Incoming Orders</div>
        </div>

        {activeOrders.length === 0 ? (
          <div style={{
            textAlign: 'center', color: 'var(--br)', fontSize: '12px', padding: '32px 0',
            background: '#fff', borderRadius: '12px', border: '1px solid var(--g100)'
          }}>
            No active orders right now
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeOrders.map(order => (
              <div key={order._id} style={{
                background: '#fff', borderRadius: '12px',
                border: '1px solid var(--g100)', padding: '16px 20px',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--soil)' }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                      background: STATUS_COLOR[order.status] + '20',
                      color: STATUS_COLOR[order.status], fontWeight: 600
                    }}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--br)', marginBottom: '6px' }}>
                    Customer: {order.customer?.name || 'Unknown'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {order.items.map((item, i) => (
                      <span key={i} style={{
                        fontSize: '11px', background: 'var(--g50)',
                        borderRadius: '6px', padding: '2px 8px', color: 'var(--soil)'
                      }}>
                        {item.name} x{item.quantity} {item.unit}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--g600)', fontWeight: 600, marginTop: '6px' }}>
                    ₹{order.totalAmount.toLocaleString()}
                  </div>
                </div>

                {NEXT_STATUS[order.status] && (
                  <button
                    disabled={updating === order._id}
                    onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])}
                    style={{
                      flexShrink: 0, fontSize: '12px', padding: '7px 14px',
                      borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: 'var(--g600)', color: '#fff', fontWeight: 600,
                      opacity: updating === order._id ? 0.6 : 1,
                    }}
                  >
                    {updating === order._id ? 'Updating...' : NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="divider" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--g100)', padding: '20px' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '14px' }}>Monthly Revenue</div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6efd0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8c5e2a' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8c5e2a' }} />
                <Tooltip
                  formatter={v => `₹${v}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #d6efd0', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#357a27" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--br)', fontSize: '12px', padding: '60px 0' }}>
              No sales data yet
            </div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--g100)', padding: '20px' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '14px' }}>Top Produce</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.produceStats.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: i < data.produceStats.length - 1 ? '1px solid var(--g50)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: i === 0 ? '#fef3c7' : i === 1 ? '#f2f9f0' : '#f5ebe0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 600, color: 'var(--br)'
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--soil)' }}>{p.name}</div>
                    {p.isImperfect && <span className="badge-imperfect">Imperfect</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--g600)' }}>₹{p.revenue}</div>
                  <div style={{ fontSize: '11px', color: 'var(--br)' }}>{p.sold} kg</div>
                </div>
              </div>
            ))}
            {data.produceStats.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--br)', fontSize: '12px', padding: '40px 0' }}>
                No sales yet
              </div>
            )}
          </div>
        </div>

      </div>

      {pastOrders.length > 0 && (
        <>
          <div className="divider" />
          <div>
            <div className="section-header" style={{ marginBottom: '14px' }}>
              <div className="section-title" style={{ fontSize: '14px' }}>Past Orders</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pastOrders.map(order => (
                <div key={order._id} style={{
                  background: '#fafafa', borderRadius: '10px',
                  border: '1px solid var(--g100)', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--soil)' }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                      background: STATUS_COLOR[order.status] + '20',
                      color: STATUS_COLOR[order.status], fontWeight: 600
                    }}>
                      {STATUS_LABEL[order.status]}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--br)' }}>
                      {order.customer?.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--g600)' }}>
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}