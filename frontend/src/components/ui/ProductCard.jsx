import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { add, update, remove, cart } = useCart();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const farmerName   = product.farmer?.name || product.farmerName || '';
  const farmerCity   = product.farmer?.address?.city || product.farmerLocation || '';

  const cartItem  = cart?.items?.find(i => i.produce === product._id || i.produce?.toString() === product._id);
  const qtyInCart = cartItem?.quantity || 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await add(product._id, 1);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Could not add to cart');
    }
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    if (qtyInCart <= 1) await remove(product._id);
    else await update(product._id, qtyInCart - 1);
  };

  const handleIncrease = async (e) => {
    e.preventDefault();
    await update(product._id, qtyInCart + 1);
  };

  return (
    <Link to={`/produce/${product._id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.img} />
        ) : (
          <div className={styles.imgPlaceholder}>No image</div>
        )}
      </div>
      <div className={styles.body}>
        {product.isOrganic && <span className={styles.tagOrg}>Organic</span>}
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.farm}>
          {farmerName}{farmerCity ? ` · ${farmerCity}` : ''}
        </p>
        <div className={styles.footer}>
          <span className={styles.price}>
            ₹{product.price} <span>/{product.unit}</span>
          </span>

          {qtyInCart > 0 ? (
            <div className={styles.qtyControls} onClick={e => e.preventDefault()}>
              <button className={styles.qtyBtn} onClick={handleDecrease}>−</button>
              <span className={styles.qtyNum}>{qtyInCart}</span>
              <button className={styles.qtyBtn} onClick={handleIncrease}>+</button>
            </div>
          ) : (
            <button className={styles.addBtn} onClick={handleAdd}>+</button>
          )}
        </div>
      </div>
    </Link>
  );
}