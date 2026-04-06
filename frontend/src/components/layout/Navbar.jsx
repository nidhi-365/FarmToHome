import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isCategory = (cat) => location.search.includes(`category=${cat}`);

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        🌿 Farm<span>App</span>
      </Link>

      <div className={styles.catNav}>
        <Link
          to="/?category=Vegetables"
          className={`${styles.catItem} ${isCategory('vegetable') ? styles.active : ''}`}
        >
          🥬 Vegetables
        </Link>
        <Link
          to="/?category=Fruits"
          className={`${styles.catItem} ${isCategory('fruit') ? styles.active : ''}`}
        >
          🍎 Fruits
        </Link>
      </div>

      <div className={styles.right}>
        {user ? (
          <>
            <Link to="/cart" className={styles.iconBtn}>
              🛒 Cart
              {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
            </Link>
            <Link to="/orders" className={styles.iconBtn}>
              📋 Orders
            </Link>
            <div className={styles.avatarWrap} ref={menuRef}>
              <button
                className={styles.avatar}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <p className={styles.dropName}>{user.name}</p>
                  <p className={styles.dropEmail}>{user.email}</p>
                  <hr className={styles.dropDivider} />
                  <Link to="/profile" className={styles.dropItem} onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <Link to="/orders"  className={styles.dropItem} onClick={() => setMenuOpen(false)}>My Orders</Link>
                  <hr className={styles.dropDivider} />
                  <button className={styles.dropLogout} onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login"    className={styles.iconBtn}>Login</Link>
            <Link to="/register" className={styles.signupBtn}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
