import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function MyProduce() {
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | imperfect | disaster | Summer | Winter | Monsoon | All Season

  const fetchProduce = async () => {
    try {
      const { data } = await api.get('/produce/my');
      setProduce(data);
    } catch { toast.error('Failed to load produce'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProduce(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/produce/${id}`);
      toast.success('Deleted');
      fetchProduce();
    } catch { toast.error('Delete failed'); }
  };

  const toggleList = async (id, isListed) => {
    try {
      await api.put(`/produce/${id}`, { isListed: !isListed });
      toast.success(isListed ? 'Unlisted' : 'Listed');
      fetchProduce();
    } catch { toast.error('Update failed'); }
  };

  // Filter produce based on selected filter
  const filtered = produce.filter(p => {
    if (filter === 'all')       return true;
    if (filter === 'imperfect') return p.isImperfect;
    if (filter === 'disaster')  return p.disaster;
    return p.season === filter;
  });

  const filterButtons = [
    { key: 'all',        label: '🌿 All' },
    { key: 'imperfect',  label: '🍂 Imperfect' },
    { key: 'disaster',   label: '⚠️ Disaster' },
  ];

  if (loading) return (
    <div style={{ color: 'var(--br)', fontSize: '13px', padding: '40px', textAlign: 'center' }}>
      Loading produce...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div className="section-title">My Produce</div>
        <Link to="/produce/add" className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px' }}>
          + Add Produce
        </Link>
      </div>

      {/* Filter bar */}
      {produce.length > 0 && (
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          marginBottom: '18px'
        }}>
          {filterButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '5px 12px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                border: `1.5px solid ${filter === key ? 'var(--g500)' : 'var(--g100)'}`,
                background: filter === key ? 'var(--g500)' : '#fff',
                color: filter === key ? '#fff' : 'var(--soil)',
                transition: 'all 0.15s'
              }}
            >
              {label}
              <span style={{
                marginLeft: '5px', fontSize: '10px',
                background: filter === key ? 'rgba(255,255,255,0.25)' : 'var(--g100)',
                color: filter === key ? '#fff' : 'var(--g600)',
                padding: '1px 5px', borderRadius: '10px'
              }}>
                {key === 'all'       ? produce.length
                : key === 'imperfect'? produce.filter(p => p.isImperfect).length
                : key === 'disaster' ? produce.filter(p => p.disaster).length
                : produce.filter(p => p.season === key).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {produce.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid var(--g100)',
          padding: '60px 24px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌱</div>
          <div className="section-title" style={{ marginBottom: '6px', fontSize: '15px' }}>
            No produce listed yet
          </div>
          <div style={{ fontSize: '12px', color: 'var(--br)', marginBottom: '20px' }}>
            Start by adding your first produce listing
          </div>
          <Link to="/produce/add" className="btn-primary" style={{ textDecoration: 'none' }}>
            Add produce →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        // No results for selected filter
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid var(--g100)',
          padding: '40px 24px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
          <div style={{ fontSize: '13px', color: 'var(--br)' }}>
            No produce found for this filter
          </div>
          <button onClick={() => setFilter('all')}
            className="btn-outline" style={{ marginTop: '12px', fontSize: '12px' }}>
            Clear filter
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map(p => (
            <div key={p._id} className="product-card">

              {/* Image */}
              <div className="product-img" style={{ position: 'relative' }}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '36px' }}>🌿</span>
                }
                {/* Listed badge */}
                <span
                  className={p.isListed ? 'badge-listed' : 'badge-unlisted'}
                  style={{ position: 'absolute', top: '8px', right: '8px' }}
                >
                  {p.isListed ? 'Listed' : 'Unlisted'}
                </span>
                {/* Disaster badge */}
                {p.disaster && (
                  <span style={{
                    position: 'absolute', top: '8px', left: '8px',
                    background: '#fff0f0', color: '#b00',
                    fontSize: '10px', fontWeight: 600,
                    padding: '2px 7px', borderRadius: '10px',
                    border: '1px solid #ffd0d0'
                  }}>
                    ⚠️ Disaster
                  </span>
                )}
              </div>

              <div className="product-body" style={{ padding: '10px 12px' }}>

                {/* Tags row */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span className={p.quality === 'Imperfect' ? 'product-tag tag-sale' : 'product-tag tag-fresh'}
                    style={{ margin: 0 }}>
                    {p.quality === 'Imperfect' ? '🍂 Imperfect' : '✅ Standard'}
                  </span>
                  {p.season && (
                    <span className="product-tag tag-org" style={{ margin: 0 }}>
                      {p.season === 'Summer'     ? '☀️' :
                       p.season === 'Winter'     ? '❄️' :
                       p.season === 'Monsoon'    ? '🌧️' : '📅'} {p.season}
                    </span>
                  )}
                </div>

                <div className="product-name">{p.name}</div>
                <div className="product-farm">{p.category} · {p.quantity} {p.unit} available</div>

                {/* Shelf life */}
                {p.shelfLife && (
                  <div style={{ fontSize: '11px', color: 'var(--br)', marginTop: '3px' }}>
                    🕐 {p.shelfLife}
                  </div>
                )}

                {/* Disaster warning */}
                {p.disaster && (
                  <div style={{
                    fontSize: '11px', color: '#b00', marginTop: '4px',
                    fontWeight: 500, background: '#fff0f0',
                    padding: '3px 8px', borderRadius: '6px',
                    display: 'inline-block'
                  }}>
                    ⚠️ Disaster affected — may need urgent sale
                  </div>
                )}

                {/* Footer */}
                <div className="product-footer" style={{ marginTop: '8px' }}>
                  <div className="product-price">
                    ₹{p.price} <span>/{p.unit}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => toggleList(p._id, p.isListed)}
                      className="btn-outline"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      {p.isListed ? 'Unlist' : 'List'}
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{
                        padding: '4px 8px', fontSize: '11px', borderRadius: '6px',
                        background: '#fff0f0', color: '#b00',
                        border: '1px solid #ffd0d0', cursor: 'pointer'
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}