import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduceById } from '../../api/produceAPI';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();

  const [item,   setItem]   = useState(null);
  const [loading,setLoading]= useState(true);
  const [qty,    setQty]    = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getProduceById(id)
      .then(setItem)
      .catch(() => toast.error('Produce not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await add(item._id, qty);
      toast.success(`${item.name} added to cart`);
    } catch {
      toast.error('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!item)   return <div className={styles.loading}>Produce not found.</div>;

  const farmer = item.farmer || {};

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
      <div className={styles.card}>
        <div className={styles.imgWrap}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className={styles.img} />
          ) : (
            <div className={styles.imgPlaceholder}>No image available</div>
          )}
        </div>
        <div className={styles.info}>
          <div className={styles.tags}>
            <span className={styles.catTag}>{item.category}</span>
            <span className={styles.qualTag}>{item.quality}</span>
            {item.isImperfect && <span className={styles.impTag}>Cosmetically imperfect</span>}
          </div>

          <h1 className={styles.name}>{item.name}</h1>

          <div className={styles.farmerBox}>
            <p className={styles.farmerName}>🌾 {farmer.name || 'Unknown farmer'}</p>
            {farmer.address?.city && (
              <p className={styles.farmerLoc}>📍 {farmer.address.city}, {farmer.address.state}</p>
            )}
            {farmer.phone && (
              <p className={styles.farmerLoc}>📞 {farmer.phone}</p>
            )}
          </div>

          {item.description && <p className={styles.desc}>{item.description}</p>}

          <div className={styles.meta}>
            {item.shelfLife && <span className={styles.metaTag}>🕐 Shelf life: {item.shelfLife}</span>}
            <span className={styles.metaTag}>📦 {item.quantity} {item.unit} available</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>₹{item.price}</span>
            <span className={styles.unit}>per {item.unit}</span>
          </div>

          {item.quantity > 0 && item.isListed ? (
            <div className={styles.qtyRow}>
              <div className={styles.qtyControl}>
                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className={styles.qtyVal}>{qty} {item.unit}</span>
                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.min(item.quantity, q + 1))}>+</button>
              </div>
              <button className={styles.addBtn} onClick={handleAdd} disabled={adding}>
                {adding ? 'Adding...' : `Add to cart — ₹${item.price * qty}`}
              </button>
            </div>
          ) : (
            <p className={styles.outOfStock}>Currently unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
}
