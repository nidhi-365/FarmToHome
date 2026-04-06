import { useState } from 'react'; 
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const soilTypes = ['Loamy', 'Sandy Loam', 'Clay', 'Alluvial', 'Black Cotton', 'Red Laterite'];
const climates  = ['Tropical', 'Semi-Arid', 'Arid', 'Humid', 'Sub-Tropical'];

const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="form-label">{label}</label>
    <input
      type={type}
      required
      className="form-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default function Register() {
  const [searchParams] = useSearchParams();
  // Read the role from the URL, default to customer if someone just types /register
  const initialRole = searchParams.get('role') === 'farmer' ? 'farmer' : 'customer';

  const [form, setForm] = useState({
    name: '', email: '', password: '', 
    role: initialRole, 
    farmName: '', location: '', soilType: '', climate: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'var(--page)', minHeight: '100vh' }}>
      <nav className="topnav">
        <div className="brand">🌿 Farm<span>ToHome</span></div>
      </nav>

      <div className="hero">
        <div style={{ color: '#fff', fontSize: '14px', opacity: 0.85 }}>
          🌾 Join FarmToHome — Register as a {form.role === 'farmer' ? 'Farmer' : 'Customer'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid var(--g100)',
          padding: '36px 40px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
        }}>
          <div style={{ marginBottom: '28px' }}>
            <div className="section-title" style={{ marginBottom: '4px' }}>Create an account</div>
            <div style={{ fontSize: '12px', color: 'var(--br)' }}>
              Fill in your details to get started
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* Dynamic Grid: 1 column for Customer, 2 columns for Farmer */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: form.role === 'farmer' ? '1fr 1fr' : '1fr', 
              gap: '14px', 
              marginBottom: '16px' 
            }}>
              <Field
                label="Full Name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Ravi Kumar"
              />
              {form.role === 'farmer' && (
                <Field
                  label="Farm Name"
                  value={form.farmName}
                  onChange={e => set('farmName', e.target.value)}
                  placeholder="e.g. Ravi Farms"
                />
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Field
                label="Email address"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {form.role === 'farmer' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Field
                    label="Location / Village"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Ramanagara, Karnataka"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Soil Type</label>
                    <select className="form-select" value={form.soilType}
                      onChange={e => set('soilType', e.target.value)}>
                      <option value="">Select soil type</option>
                      {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Climate</label>
                    <select className="form-select" value={form.climate}
                      onChange={e => set('climate', e.target.value)}>
                      <option value="">Select climate</option>
                      {climates.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '8px' }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--br)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--g500)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="app-footer">
        <div className="footer-text">🌿 FarmToHome · Connecting farmers &amp; customers</div>
      </div>
    </div>
  );
}