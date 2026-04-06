import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--page)', minHeight: '100vh' }}>

      {/* Top nav */}
      <nav className="topnav">
        <div className="brand">🌿 Farm<span>ToHome</span></div>
      </nav>

      {/* Hero bar */}
      <div className="hero">
        <div style={{ color: '#fff', fontSize: '14px', opacity: 0.85 }}>
          🌾 Farm-fresh produce, delivered straight to your door — no middlemen
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ width: '100%', maxWidth: '720px' }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-title" style={{ fontSize: '26px', marginBottom: '8px' }}>
              Welcome to FarmToHome
            </div>
            <div style={{ fontSize: '13px', color: 'var(--br)' }}>
              Are you shopping for fresh produce, or managing your farm?
            </div>
          </div>

          {/* Two role cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Customer card */}
            <div style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid var(--g100)',
              padding: '36px 32px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '14px'
            }}>
              <div style={{ fontSize: '52px' }}>🛒</div>
              <div>
                <div className="section-title" style={{ fontSize: '18px', marginBottom: '6px' }}>
                  I'm a Customer
                </div>
                <div style={{ fontSize: '12px', color: 'var(--br)', lineHeight: '1.6' }}>
                  Browse fresh fruits, vegetables and more — sourced directly from local farmers.
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: '14px', marginTop: '4px' }}
                onClick={() => navigate('/login?role=customer')}
              >
                Sign in as Customer
              </button>
              <div style={{ fontSize: '12px', color: 'var(--br)' }}>
                No account?{' '}
                <span
                  // 👇 CHANGED HERE: Added ?role=customer
                  onClick={() => navigate('/register?role=customer')}
                  style={{ color: 'var(--g500)', fontWeight: 500, cursor: 'pointer' }}
                >
                  Register here
                </span>
              </div>
            </div>

            {/* Farmer card */}
            <div style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid var(--g100)',
              padding: '36px 32px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '14px'
            }}>
              <div style={{ fontSize: '52px' }}>🌾</div>
              <div>
                <div className="section-title" style={{ fontSize: '18px', marginBottom: '6px' }}>
                  I'm a Farmer
                </div>
                <div style={{ fontSize: '12px', color: 'var(--br)', lineHeight: '1.6' }}>
                  List your produce, manage orders, and reach customers directly — no middlemen.
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: '14px', marginTop: '4px' }}
                onClick={() => navigate('/login?role=farmer')}
              >
                Sign in as Farmer
              </button>
              <div style={{ fontSize: '12px', color: 'var(--br)' }}>
                New farmer?{' '}
                <span
                  // 👇 CHANGED HERE: Added ?role=farmer
                  onClick={() => navigate('/register?role=farmer')}
                  style={{ color: 'var(--g500)', fontWeight: 500, cursor: 'pointer' }}
                >
                  Register here
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="app-footer">
        <div className="footer-text">🌿 FarmToHome · Connecting farmers &amp; customers</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span className="footer-link">About</span>
          <span className="footer-link">Help</span>
          <span className="footer-link">Terms</span>
        </div>
      </div>

    </div>
  );
}