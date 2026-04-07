import { useEffect, useState } from 'react';
import api from '../api/axios';
import aiApi from '../api/aiAxios';
import toast from 'react-hot-toast';

export default function CropRecommendations() {
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [fertExpanded, setFertExpanded] = useState(null);
  const [fertData, setFertData] = useState({});
  const [loading, setLoading] = useState(true);

  // ── AI Fertilizer States ──
  const [npk, setNpk] = useState({ nitrogen: '', phosphorus: '', potassium: '' });
  const [fertResult, setFertResult] = useState(null);
  const [fertLoading, setFertLoading] = useState(false);

  useEffect(() => {
    api.get('/crops/recommend')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadFertilizer = async (cropId) => {
    if (fertData[cropId]) {
      setFertExpanded(fertExpanded === cropId ? null : cropId);
      return;
    }
    try {
      const { data: res } = await api.get(`/crops/${cropId}/fertilizers`);
      setFertData(prev => ({ ...prev, [cropId]: res }));
      setFertExpanded(cropId);
    } catch { console.error('Failed to load fertilizer'); }
  };

  // ── AI Fertilizer Fetch ──
  const fetchFertilizer = async () => {
    if (!npk.nitrogen || !npk.phosphorus || !npk.potassium) {
      toast.error('Please enter all NPK values');
      return;
    }
    setFertLoading(true);
    setFertResult(null);
    try {
      const res = await aiApi.post('/fertilizer', {
        nitrogen: Number(npk.nitrogen),
        phosphorus: Number(npk.phosphorus),
        potassium: Number(npk.potassium),
      });
      setFertResult(res.data.fertilizer);
    } catch {
      toast.error('Fertilizer suggestion failed — is Flask running?');
    } finally {
      setFertLoading(false);
    }
  };

  const demandStyle = {
    High:   { background: 'var(--g100)', color: 'var(--g600)' },
    Medium: { background: 'var(--y100)', color: 'var(--y600)' },
    Low:    { background: '#f5ebe0',     color: 'var(--br)'   },
  };

  const fertilizerInfo = {
    'Urea':    { icon: '🔵', desc: 'High nitrogen source. Best for leafy growth stage.', tip: 'Apply during early vegetative stage.' },
    'DAP':     { icon: '🟤', desc: 'Diammonium Phosphate. Boosts root & flower development.', tip: 'Apply at sowing time for best results.' },
    'Compost': { icon: '🟢', desc: 'Organic matter. Improves soil structure & microbial activity.', tip: 'Mix into soil before planting.' },
  };

  if (loading) return (
    <div style={{ color: 'var(--br)', fontSize: '13px', padding: '40px', textAlign: 'center' }}>
      Loading recommendations...
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Smart Crop Recommendations</div>
        <div style={{ fontSize: '12px', color: 'var(--br)' }}>Based on your soil, climate & market demand</div>
      </div>

      {/* ── AI Fertilizer Suggester Card ── */}
      <div style={{
        background: '#fff', borderRadius: '12px',
        border: '1px solid var(--g100)', padding: '18px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '18px' }}></span>
          <div className="sidebar-heading" style={{ fontSize: '13px' }}>AI Fertilizer Suggester</div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--br)', marginBottom: '14px' }}>
          Enter your soil's NPK values to get an AI-powered fertilizer recommendation
        </div>

        {/* NPK Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          {[
            { key: 'nitrogen',   label: 'Nitrogen (N)',   color: '#3b82f6', bg: '#eff6ff' },
            { key: 'phosphorus', label: 'Phosphorus (P)', color: '#a855f7', bg: '#faf5ff' },
            { key: 'potassium',  label: 'Potassium (K)',  color: '#f97316', bg: '#fff7ed' },
          ].map(({ key, label, color, bg }) => (
            <div key={key}>
              <label style={{ fontSize: '11px', fontWeight: 600, color, display: 'block', marginBottom: '4px' }}>
                {label}
              </label>
              <input
                type="number" min="0" max="200"
                className="form-input"
                placeholder="0–200"
                value={npk[key]}
                onChange={e => setNpk(p => ({ ...p, [key]: e.target.value }))}
                style={{ background: bg, borderColor: color + '44', fontSize: '13px' }}
              />
            </div>
          ))}
        </div>

        {/* Suggest Button */}
        <button
          onClick={fetchFertilizer}
          disabled={fertLoading}
          className="btn-primary"
          style={{ width: '100%', padding: '9px', fontSize: '13px' }}
        >
          {fertLoading ? 'Analysing soil...' : '🌱 Get Fertilizer Suggestion'}
        </button>

        {/* Result */}
        {fertResult && (
          <div style={{
            marginTop: '14px', padding: '14px 16px', borderRadius: '10px',
            background: '#f0fdf4', border: '1px solid var(--g300)',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--g600)', fontWeight: 600, marginBottom: '8px' }}>
              ✅ AI Recommendation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>{fertilizerInfo[fertResult]?.icon || '🌿'}</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--soil)' }}>{fertResult}</div>
                <div style={{ fontSize: '11px', color: 'var(--br)' }}>
                  {fertilizerInfo[fertResult]?.desc || 'Recommended based on your soil nutrients.'}
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '11px', color: 'var(--g700)', background: 'var(--g50)',
              padding: '8px 10px', borderRadius: '7px', borderLeft: '3px solid var(--g400)'
            }}>
              💡 {fertilizerInfo[fertResult]?.tip || 'Apply as directed on the packaging.'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--br)', marginTop: '8px', fontStyle: 'italic' }}>
              * Based on N:{npk.nitrogen} P:{npk.phosphorus} K:{npk.potassium} values
            </div>
          </div>
        )}
      </div>

      {/* Festival banner */}
      {data?.upcomingFestival && (
        <div className="cart-bar" style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '22px' }}>🎉</div>
          <div className="cart-bar-text">
            <strong>{data.upcomingFestival} season demand boost active!</strong>
            Crops with high festival demand are sorted to the top. Start growing them now.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data?.crops?.map((crop, i) => (
          <div key={crop._id} style={{
            background: '#fff', borderRadius: '12px',
            border: '1px solid var(--g100)', overflow: 'hidden'
          }}>
            {/* Crop header */}
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: i === 0 ? 'var(--y100)' : 'var(--g50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 600,
                    color: i === 0 ? 'var(--y600)' : 'var(--g600)'
                  }}>
                    #{i + 1}
                  </div>
                  <div>
                    <div className="farmer-name">{crop.name}</div>
                    <div className="farmer-loc">
                      {crop.growthDurationDays} days growth · ₹{crop.baseMarketPrice}/kg market rate
                    </div>
                  </div>
                </div>
                <span className="product-tag" style={{ ...demandStyle[crop.demandLevel], margin: 0 }}>
                  {crop.demandLevel} Demand
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {crop.soilTypes?.map(s => (
                  <span key={s} className="product-tag tag-org" style={{ margin: 0 }}>🪨 {s}</span>
                ))}
                {crop.climates?.map(c => (
                  <span key={c} className="product-tag" style={{ background: '#e8f4fd', color: '#1a6fa8', margin: 0 }}>🌤 {c}</span>
                ))}
                {crop.festivalDemand?.map(f => (
                  <span key={f} className="product-tag tag-fresh" style={{ margin: 0 }}>🎊 {f}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-outline"
                  style={{ fontSize: '12px', padding: '5px 12px' }}
                  onClick={() => setExpanded(expanded === crop._id ? null : crop._id)}
                >
                  🌱 Growing Tips {expanded === crop._id ? '▲' : '▼'}
                </button>
                <button
                  className="btn-outline"
                  style={{ fontSize: '12px', padding: '5px 12px', borderColor: 'var(--y300)', color: 'var(--y600)' }}
                  onClick={() => loadFertilizer(crop._id)}
                >
                  💧 Fertilizers {fertExpanded === crop._id ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Growing tips panel */}
            {expanded === crop._id && (
              <div style={{ borderTop: '1px solid var(--g100)', padding: '14px 16px', background: 'var(--g50)' }}>
                <div className="sidebar-heading" style={{ marginBottom: '8px' }}>Growing Tips</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {crop.growingTips?.map((tip, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--soil)' }}>
                      <span style={{ color: 'var(--g500)', fontWeight: 700 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fertilizer panel */}
            {fertExpanded === crop._id && fertData[crop._id] && (
              <div style={{ borderTop: '1px solid var(--g100)', padding: '14px 16px', background: 'var(--y100)' }}>
                <div className="sidebar-heading" style={{ marginBottom: '10px', color: 'var(--y600)' }}>Fertilizer Plan</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {fertData[crop._id].fertilizers?.map((f, idx) => (
                    <div key={idx} style={{
                      background: '#fff', borderRadius: '8px', padding: '10px 12px',
                      border: '1px solid var(--y200)'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--soil)', marginBottom: '4px' }}>{f.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--br)' }}>Dosage: <strong>{f.dosage}</strong></div>
                      <div style={{ fontSize: '11px', color: 'var(--br)' }}>When: <strong>{f.timing}</strong></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {data?.crops?.length === 0 && (
          <div style={{
            background: '#fff', borderRadius: '12px', border: '1px solid var(--g100)',
            padding: '60px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
            <div className="section-title" style={{ fontSize: '15px', marginBottom: '6px' }}>
              No crops matched your profile
            </div>
            <div style={{ fontSize: '12px', color: 'var(--br)' }}>
              Update your soil type and climate in your account settings.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}