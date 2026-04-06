// ImperfectMarket.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ImperfectMarket() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | disaster | Summer | Winter | Monsoon | All Season

  useEffect(() => {
    api.get('/produce/imperfect')
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  //const discountedPrice = (price) => Math.round(price * 0.7);

  // Filter items
  const filtered = items.filter(item => {
    if (filter === 'all')      return true;
    if (filter === 'disaster') return item.disaster;
    return item.season === filter;
  });

  const filterButtons = [
    { key: 'all',        label: '🍂 All' },
    { key: 'disaster',   label: '⚠️ Disaster' },
    { key: 'Summer',     label: '☀️ Summer' },
    { key: 'Winter',     label: '❄️ Winter' },
    { key: 'Monsoon',    label: '🌧️ Monsoon' },
    { key: 'All Season', label: '📅 All Season' },
  ];

  if (loading) return (
    <div style={{ color: 'var(--br)', fontSize: '13px', padding: '40px', textAlign: 'center' }}>
      Loading...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div className="section-title">Imperfect Produce Marketplace</div>
        <div style={{ fontSize: '12px', color: 'var(--br)' }}>{items.length} listings</div>
      </div>

      {/* Info banner */}
      <div className="cart-bar" style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '22px' }}>🍂</div>
        <div className="cart-bar-text">
          <strong>Reduce waste, earn more</strong>
          Cosmetically imperfect crops are listed here. Customers actively seek deals in this section.
        </div>
      </div>

      {/* Filter bar */}
      {items.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
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
                {key === 'all'      ? items.length
                : key === 'disaster'? items.filter(i => i.disaster).length
                : items.filter(i => i.season === key).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state — no items at all */}
      {items.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid var(--g100)',
          padding: '60px 24px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🍂</div>
          <div className="section-title" style={{ fontSize: '15px', marginBottom: '6px' }}>
            No imperfect produce listed
          </div>
          <div style={{ fontSize: '12px', color: 'var(--br)' }}>
            When you mark produce as "Imperfect" while adding it, it appears here automatically.
          </div>
        </div>

      /* Empty state — filter returned nothing */
      ) : filtered.length === 0 ? (
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
          {filtered.map(item => (
            <div key={item._id} className="product-card">

              {/* Image */}
              <div className="product-img" style={{ position: 'relative' }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '36px' }}>🍂</span>
                }

                {/* 30% OFF badge */}
                <span className="product-tag tag-sale"
                  style={{ position: 'absolute', top: '8px', left: '8px', margin: 0 }}>
                  30% OFF
                </span>

                {/* Disaster badge */}
                {item.disaster && (
                  <span style={{
                    position: 'absolute', top: '8px', right: '8px',
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

                {/* Season tag */}
                {item.season && (
                  <span className="product-tag tag-org" style={{ margin: '0 0 6px 0', display: 'inline-block' }}>
                    {item.season === 'Summer'  ? '☀️' :
                     item.season === 'Winter'  ? '❄️' :
                     item.season === 'Monsoon' ? '🌧️' : '📅'} {item.season}
                  </span>
                )}

                <div className="product-name">{item.name}</div>
                <div className="product-farm">{item.category} · {item.quantity} {item.unit} available</div>

                {/* Shelf life */}
                {item.shelfLife && (
                  <div style={{ fontSize: '11px', color: 'var(--br)', marginTop: '3px' }}>
                    🕐 {item.shelfLife}
                  </div>
                )}

                {/* Disaster warning */}
                {item.disaster && (
                  <div style={{
                    fontSize: '11px', color: '#b00', marginTop: '4px',
                    fontWeight: 500, background: '#fff0f0',
                    padding: '3px 8px', borderRadius: '6px',
                    display: 'inline-block'
                  }}>
                    ⚠️ Disaster affected — urgent sale recommended
                  </div>
                )}

                {/* Price footer */}
                <div className="product-footer" style={{ marginTop: '8px' }}>
                  <div>
                    <span className="product-price">₹{item.price}</span>
                    {/*<span style={{ fontSize: '11px', color: 'var(--br)', textDecoration: 'line-through' }}>
                      ₹{item.price}
                    </span>*/}
                    <span style={{ fontSize: '10px', color: 'var(--br)' }}> /{item.unit}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--g500)', fontWeight: 500 }}>✅ Listed</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}