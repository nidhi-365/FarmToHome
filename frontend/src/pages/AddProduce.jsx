import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import aiApi from '../api/aiAxios';
import toast from 'react-hot-toast';

const categories = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Dairy', 'Other'];
const seasons = ['Summer', 'Winter', 'Monsoon', 'Autumn'];

const KNOWN_VEGETABLES = [
  'bitter gourd', 'brinjal', 'cabage', 'califlower', 'chilly',
  'cucumber', 'garlic', 'ginger', 'okra', 'onion', 'peas',
  'pointed grourd', 'potato', 'pumkin', 'raddish', 'radish', 'tomato'
];

const seasonMap = {
  'Summer': 'summer',
  'Winter': 'winter',
  'Monsoon': 'monsoon',
  'Autumn': 'autumn',
};

const conditionMap = {
  'Standard': 'fresh',
  'Imperfect': 'scrap',
};

export default function AddProduce() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [unknownVeg, setUnknownVeg] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', quantity: '', unit: 'kg',
    price: '', description: '', quality: 'Standard',
    shelfLife: '', season: '', disaster: false
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── AI Price Fetch ──
  const fetchPrice = async ({ name, season, quality, disaster }) => {
    const vegName = (name || '').toLowerCase().trim();
    const seasonVal = seasonMap[season];

    setSuggestedPrice(null);
    setUnknownVeg(false);

    if (!vegName || !seasonVal) return;

    if (!KNOWN_VEGETABLES.includes(vegName)) {
      setUnknownVeg(true);
      return;
    }

    setPriceLoading(true);
    try {
      const month = new Date().getMonth() + 1;
      const res = await aiApi.post('/price', {
        vegetable: vegName,
        season: seasonVal,
        month,
        temp: 30,
        disaster: disaster ? 'yes' : 'no',
        condition: conditionMap[quality] || 'fresh',
      });
      if (res.data.predicted_price !== undefined) {
        const price = Math.round(res.data.predicted_price);
        setSuggestedPrice(price);
        setForm(f => ({ ...f, price })); // ← auto-fill price field
      }
    } catch {
      // Flask not running — fail silently
    } finally {
      setPriceLoading(false);
    }
  };

  // ── Handlers ──
  const handleNameChange = (e) => {
    const name = e.target.value;
    set('name', name);
    if (form.category === 'Vegetables') {
      fetchPrice({ name, season: form.season, quality: form.quality, disaster: form.disaster });
    } else {
      setSuggestedPrice(null);
      setUnknownVeg(false);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    set('category', category);
    if (category !== 'Vegetables') {
      setSuggestedPrice(null);
      setUnknownVeg(false);
      setForm(f => ({ ...f, category, price: '' }));
    } else {
      fetchPrice({ name: form.name, season: form.season, quality: form.quality, disaster: form.disaster });
    }
  };

  const handleSeasonChange = (e) => {
    const season = e.target.value;
    set('season', season);
    if (form.category === 'Vegetables') {
      fetchPrice({ name: form.name, season, quality: form.quality, disaster: form.disaster });
    }
  };

  const handleQualityChange = (q) => {
    set('quality', q);
    if (form.category === 'Vegetables') {
      fetchPrice({ name: form.name, season: form.season, quality: q, disaster: form.disaster });
    }
  };

  const handleDisasterChange = (val) => {
    set('disaster', val);
    if (form.category === 'Vegetables') {
      fetchPrice({ name: form.name, season: form.season, quality: form.quality, disaster: val });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await api.post('/produce', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Produce listed!');
      navigate('/produce');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Add New Produce</div>
        <button onClick={() => navigate('/produce')} className="btn-outline" style={{ fontSize: '12px' }}>
          ← Back
        </button>
      </div>

      <div style={{
        background: '#fff', borderRadius: '12px',
        border: '1px solid var(--g100)', padding: '28px',
        maxWidth: '640px'
      }}>
        <form onSubmit={handleSubmit}>

          {/* Image upload */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Produce Image</label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '140px', borderRadius: '10px',
              border: '2px dashed var(--g200)', background: 'var(--g50)',
              cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s'
            }}>
              {preview
                ? <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>📷</div>
                    <div style={{ fontSize: '12px', color: 'var(--br)' }}>Click to upload image</div>
                  </div>
              }
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            </label>
          </div>

          {/* Name + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Produce Name *</label>
              <input className="form-input" required placeholder="e.g. Tomato"
                value={form.name} onChange={handleNameChange} />
              {unknownVeg && (
                <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px' }}>
                  ⚠️ AI doesn't know this vegetable — enter price manually
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="form-select" required value={form.category} onChange={handleCategoryChange}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Quantity + Unit + Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '4px' }}>
            <div>
              <label className="form-label">Quantity *</label>
              <input type="number" min="0" className="form-input" required
                value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {['kg', 'g', 'dozen', 'litre', 'piece', 'bundle'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">
                Price (₹) *
                {priceLoading && (
                  <span style={{ fontSize: '10px', color: 'var(--g500)', marginLeft: '6px', fontWeight: 400 }}>
                    🤖 predicting...
                  </span>
                )}
                {suggestedPrice && !priceLoading && (
                  <span style={{ fontSize: '10px', color: 'var(--g500)', marginLeft: '6px', fontWeight: 400 }}>
                    🤖 AI filled
                  </span>
                )}
              </label>
              <input
                type="number" min="0" className="form-input" required
                value={form.price}
                onChange={e => {
                  set('price', e.target.value);
                  setSuggestedPrice(null);
                }}
                placeholder={form.category !== 'Vegetables' ? 'Enter manually' : 'Auto-filled by AI'}
                style={{
                  borderColor: suggestedPrice && !priceLoading ? 'var(--g400)' : undefined,
                  background: suggestedPrice && !priceLoading ? '#f0fdf4' : undefined,
                }}
              />
            </div>
          </div>

          {/* AI Price Banner */}
          {form.category === 'Vegetables' && suggestedPrice && !priceLoading && (
            <div style={{
              marginBottom: '16px', marginTop: '6px',
              padding: '10px 14px', borderRadius: '8px',
              background: '#f0fdf4', border: '1px solid var(--g300)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--g700)', fontWeight: 600 }}>
                  🤖 AI Price Suggestion: ₹{suggestedPrice}/kg
                </div>
                <div style={{ fontSize: '11px', color: 'var(--g500)', marginTop: '2px' }}>
                  Based on season, market trends & produce condition
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, price: suggestedPrice }))}
                style={{
                  fontSize: '12px', padding: '6px 14px', borderRadius: '6px',
                  background: 'var(--g500)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                Use ₹{suggestedPrice}
              </button>
            </div>
          )}

          {/* Manual price note — non-Vegetables */}
          {form.category && form.category !== 'Vegetables' && (
            <div style={{
              marginBottom: '16px', marginTop: '6px',
              padding: '8px 12px', borderRadius: '8px',
              background: '#fffbeb', border: '1px solid #fcd34d',
              fontSize: '11px', color: '#92400e'
            }}>
              💡 AI price prediction is only available for vegetables. Please enter the price manually.
            </div>
          )}

          {/* Quality + Shelf life */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Quality</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {['Standard', 'Imperfect'].map(q => (
                  <button
                    key={q} type="button"
                    onClick={() => handleQualityChange(q)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: '8px',
                      fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                      border: `1.5px solid ${form.quality === q ? (q === 'Standard' ? 'var(--g500)' : 'var(--y500)') : 'var(--g100)'}`,
                      background: form.quality === q ? (q === 'Standard' ? 'var(--g500)' : 'var(--y300)') : '#fff',
                      color: form.quality === q ? (q === 'Standard' ? '#fff' : 'var(--y600)') : 'var(--soil)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {q === 'Standard' ? '✅ ' : '🍂 '}{q}
                  </button>
                ))}
              </div>
              {form.quality === 'Imperfect' && (
                <div style={{ fontSize: '11px', color: 'var(--y500)', marginTop: '6px' }}>
                  Auto-listed in Imperfect Market
                </div>
              )}
            </div>
            <div>
              <label className="form-label">Shelf Life</label>
              <input className="form-input" placeholder="e.g. 3 days, 1 week"
                value={form.shelfLife} onChange={e => set('shelfLife', e.target.value)} />
            </div>
          </div>

          {/* Season + Disaster */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Season</label>
              <select className="form-select" value={form.season} onChange={handleSeasonChange}>
                <option value="">Select season</option>
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Disaster Affected?</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {[['✅ No', false], ['⚠️ Yes', true]].map(([label, val]) => (
                  <button
                    key={label} type="button"
                    onClick={() => handleDisasterChange(val)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: '8px',
                      fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                      border: `1.5px solid ${form.disaster === val
                        ? (val ? '#b00' : 'var(--g500)')
                        : 'var(--g100)'}`,
                      background: form.disaster === val
                        ? (val ? '#fff0f0' : 'var(--g500)')
                        : '#fff',
                      color: form.disaster === val
                        ? (val ? '#b00' : '#fff')
                        : 'var(--soil)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {form.disaster === true && (
                <div style={{ fontSize: '11px', color: '#b00', marginTop: '6px' }}>
                  ⚠️ This produce will be flagged as disaster affected
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Description</label>
            <textarea rows={3} className="form-input" placeholder="Briefly describe your produce..."
              style={{ resize: 'vertical' }}
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-outline" onClick={() => navigate('/produce')}
              style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ flex: 2, padding: '10px' }}>
              {loading ? 'Listing...' : 'List Produce →'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}