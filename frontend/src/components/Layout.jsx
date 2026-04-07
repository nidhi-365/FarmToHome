import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/',            icon: '📊', label: 'Dashboard' },
  { to: '/produce',     icon: '🧺', label: 'My Produce' },
  { to: '/imperfect',   icon: '🍂', label: 'Imperfect Market' },
  { to: '/crops',       icon: '🌱', label: 'Crop Guide' },
  { to: '/my-orders',   icon: '📦', label: 'My Orders' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'F';

  return (
    <div style={{ background: 'var(--page)', minHeight: '100vh' }}>

      {/* ── Top Nav ── */}
      <nav className="topnav">
        <div className="brand">🌿 Farm<span>ToHome</span></div>

        {/* Category nav — farmer sections */}
        <div className="cat-nav" style={{ display: 'flex' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `cat-item${isActive ? ' active' : ''}`}
            >
              {icon} {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
          <button className="nav-btn" onClick={handleLogout} title="Logout">
            <span style={{ fontSize: '17px' }}>🚪</span> Logout
          </button>
          <div className="avatar" title={user?.name}>{initials}</div>
        </div>
      </nav>

      {/* ── Page body: sidebar + main ── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>

        {/* ── Sidebar ── */}
        <aside className="sidebar" style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', height: 'calc(100vh - 56px)', overflowY: 'auto' }}>

          <div className="sidebar-section">
            <div className="sidebar-heading">Farmer Menu</div>
            {navItems.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <span className="s-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading">Quick Actions</div>
            <div
              className="sidebar-link"
              onClick={() => navigate('/produce/add')}
              style={{ cursor: 'pointer' }}
            >
              <span className="s-icon">➕</span> Add Produce
            </div>
            <div
              className="sidebar-link"
              onClick={() => navigate('/crops')}
              style={{ cursor: 'pointer' }}
            >
              <span className="s-icon">🌾</span> Crop Suggestions
            </div>
          </div>

        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, padding: '24px', minWidth: 0, background: 'var(--cream)' }}>
          <Outlet />
        </main>

      </div>

      {/* ── Footer ── */}
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