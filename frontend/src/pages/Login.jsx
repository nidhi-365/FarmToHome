import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      console.log('Login response:', data); // ← check browser console for role
      login(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'var(--page)', minHeight: '100vh' }}>

      {/* Top nav */}
      <nav className="topnav">
        <div className="brand">🌿 Farm<span>App</span></div>
      </nav>

      {/* Hero bar */}
      <div className="hero">
        <div style={{ color: '#fff', fontSize: '14px', opacity: 0.85 }}>
          🌾 Farmer's Portal — Sign in to manage your produce and listings
        </div>
      </div>

      {/* Login card */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid var(--g100)',
          padding: '36px 40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
        }}>
          <div style={{ marginBottom: '28px' }}>
            <div className="section-title" style={{ marginBottom: '4px' }}>Sign in</div>
            <div style={{ fontSize: '12px', color: 'var(--br)' }}>Access your farmer dashboard</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Email address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--br)' }}>
            New farmer?{' '}
            <Link to="/register" style={{ color: 'var(--g500)', fontWeight: 500, textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <div className="app-footer">
        <div className="footer-text">🌿 FarmApp · Connecting farmers &amp; customers</div>
      </div>
    </div>
  );
}