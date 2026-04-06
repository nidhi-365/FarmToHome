import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProduce } from '../../api/customer/produceAPI';
import { getMyOrders } from '../../api/customer/orderAPI';
import { getRecipes } from '../../api/customer/mlAPI';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import styles from './MarketplacePage.module.css';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { add, update, remove, cart, cartProduceNames } = useCart();

  const categoryParam = searchParams.get('category') || '';

  const [produce,     setProduce]     = useState([]);
  const [prevItems,   setPrevItems]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [page,        setPage]        = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');

  // Recipe panel
  const [showRecipes,    setShowRecipes]    = useState(false);
  const [recipes,        setRecipes]        = useState([]);
  const [recipeLoading,  setRecipeLoading]  = useState(false);
  const [recipeIngInput, setRecipeIngInput] = useState('');

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sort:     'newest',
  });

  // ── Fetch produce ──────────────────────────────────────────
  const fetchProduce = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, limit: 12,
        ...(categoryParam     && { category: categoryParam }),
        ...(filters.minPrice  && { minPrice: filters.minPrice }),
        ...(filters.maxPrice  && { maxPrice: filters.maxPrice }),
        ...(filters.sort      && { sort: filters.sort }),
        ...(search            && { search }),
      };
      const data = await getProduce(params);
      setProduce(data.produce ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load produce');
      setProduce([]);
    } finally {
      setLoading(false);
    }
  }, [categoryParam, filters, page, search]);

  useEffect(() => { fetchProduce(); }, [fetchProduce]);
  useEffect(() => { setPage(1); }, [categoryParam]);

  // ── Buy again ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getMyOrders().then((orders) => {
      const seen  = new Set();
      const items = [];
      for (const order of orders) {
        for (const item of order.items) {
          const key = item.produce?.toString() || item.name;
          if (!seen.has(key)) {
            seen.add(key);
            items.push(item);
          }
        }
        if (items.length >= 8) break;
      }
      setPrevItems(items);
    }).catch(() => {});
  }, [user]);

  // ── Handlers ───────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const handleAdd = async (item, name) => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      await add(item._id, 1);
      toast.success(`${name} added to cart`);
    } catch {
      toast.error('Could not add to cart');
    }
  };

  const handleReorder = async (produceId, name) => {
    if (!user) return;
    try {
      await add(produceId, 1);
      toast.success(`${name} added to cart`);
    } catch {
      toast.error('Could not add item');
    }
  };

  // ── Recipe recommender ─────────────────────────────────────
  const handleGetRecipes = async () => {
    const manualItems = recipeIngInput
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    const allItems = [...new Set([...(cartProduceNames ?? []), ...manualItems])];

    if (allItems.length === 0) {
      toast('Add items to your cart or type ingredients above');
      return;
    }

    setRecipeLoading(true);
    setShowRecipes(true);
    try {
      const data = await getRecipes(allItems);
      setRecipes(data ?? []);
    } catch {
      toast.error('Recipe service unavailable');
      setRecipes([]);
    } finally {
      setRecipeLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Search hero ── */}
      <div className={styles.hero}>
        <form className={styles.searchWrap} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            placeholder="Search for tomatoes, mangoes, spinach..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
        <div className={styles.locationPill}>📍 Bengaluru, KA</div>
      </div>

      <div className={styles.body}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <p className={styles.sideHeading}>Categories</p>
            <div
              className={`${styles.sideLink} ${!categoryParam ? styles.sideLinkActive : ''}`}
              onClick={() => setSearchParams({})}
            >🌿 All produce</div>
            <div
              className={`${styles.sideLink} ${categoryParam === 'Vegetables' ? styles.sideLinkActive : ''}`}
              onClick={() => setSearchParams({ category: 'Vegetables' })}
            >🥬 Vegetables</div>
            <div
              className={`${styles.sideLink} ${categoryParam === 'Fruits' ? styles.sideLinkActive : ''}`}
              onClick={() => setSearchParams({ category: 'Fruits' })}
            >🍎 Fruits</div>
          </div>

          <div className={styles.sideSection}>
            <p className={styles.sideHeading}>Price per kg</p>
            <div className={styles.priceRow}>
              <input className={styles.priceInput} placeholder="₹ Min" type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
              <span className={styles.priceDash}>—</span>
              <input className={styles.priceInput} placeholder="₹ Max" type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
            </div>
          </div>

          <div className={styles.sideSection}>
            <p className={styles.sideHeading}>Sort by</p>
            {[
              { val: 'newest',     label: 'Newest first' },
              { val: 'price_asc',  label: 'Price: low to high' },
              { val: 'price_desc', label: 'Price: high to low' },
            ].map(({ val, label }) => (
              <label key={val} className={styles.checkRow}>
                <input type="radio" name="sort" checked={filters.sort === val}
                  onChange={() => handleFilterChange('sort', val)} />
                {label}
              </label>
            ))}
          </div>

          {/* ── Recipe panel (sidebar) ── */}
          <div className={styles.recipePanel}>
            <p className={styles.sideHeading}>🍳 What can I cook?</p>
            <p className={styles.recipeSub}>
              {(cartProduceNames ?? []).length > 0
                ? `Using ${cartProduceNames.join(', ')} from your cart`
                : 'Add items to your cart or type ingredients below'}
            </p>
            <input
              className={styles.recipeInput}
              placeholder="+ more: garlic, ginger..."
              value={recipeIngInput}
              onChange={(e) => setRecipeIngInput(e.target.value)}
            />
            <button className={styles.recipeBtn} onClick={handleGetRecipes}>
              Get recipe ideas
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className={styles.main}>

          {/* Recipe results */}
          {showRecipes && (
            <div className={styles.recipeResults}>
              <div className={styles.recipeResultsHeader}>
                <h2 className={styles.sectionTitle}>Recipe suggestions</h2>
                <button className={styles.closeRecipes} onClick={() => setShowRecipes(false)}>✕ Close</button>
              </div>
              {recipeLoading ? (
                <p className={styles.recipeLoading}>Finding recipes...</p>
              ) : recipes.length === 0 ? (
                <p className={styles.recipeLoading}>No matching recipes found.</p>
              ) : (
                <div className={styles.recipeCards}>
                  {recipes.map((r, i) => (
                    <div key={i} className={styles.recipeCard}>
                      <div className={styles.recipeCardTop}>
                        <p className={styles.recipeName}>{r.name}</p>
                        <span className={styles.recipeScore}>
                          {r.score} ingredient{r.score !== 1 ? 's' : ''} matched
                        </span>
                      </div>
                      {r.missing.length > 0 && (
                        <p className={styles.recipeMissing}>
                          <span>Still need: </span>
                          {r.missing.slice(0, 5).join(', ')}
                          {r.missing.length > 5 && ` +${r.missing.length - 5} more`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Buy again */}
          {user && prevItems.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Buy again</h2>
                <Link to="/orders" className={styles.sectionLink}>View history →</Link>
              </div>
              <div className={styles.prevRow}>
                {prevItems.map((item) => (
                  <div key={item.produce} className={styles.prevCard}>
                    <div className={styles.prevImgWrap}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className={styles.prevImg} />
                      ) : (
                        <div className={styles.prevPlaceholder}>🌿</div>
                      )}
                    </div>
                    <p className={styles.prevName}>{item.name}</p>
                    <p className={styles.prevPrice}>₹{item.price}/{item.unit}</p>
                    <button className={styles.reorderBtn}
                      onClick={() => handleReorder(item.produce, item.name)}>
                      + Add
                    </button>
                  </div>
                ))}
              </div>
              <hr className={styles.divider} />
            </section>
          )}

          {/* Produce grid */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {categoryParam === 'Vegetables' ? 'Fresh vegetables'
                  : categoryParam === 'Fruits' ? 'Fresh fruits'
                  : 'All produce'}
              </h2>
            </div>

            {loading ? (
              <div className={styles.grid}>
                {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : produce.length === 0 ? (
              <div className={styles.empty}>No produce found. Try adjusting filters.</div>
            ) : (
              <div className={styles.grid}>
                {produce.map((item) => (
                  <ProduceCard key={item._id} item={item} onAdd={handleAdd} cart={cart} onUpdate={update} onRemove={remove} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                <button className={styles.pageBtn} disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

// ── Produce card ───────────────────────────────────────────
function ProduceCard({ item, onAdd, cart, onUpdate, onRemove }) {
  const farmerCity  = item.farmer?.address?.city || '';
  const farmerName  = item.farmer?.name || 'Unknown farmer';
  const cartItem    = cart?.items?.find(i => i.produce === item._id || i.produce?.toString() === item._id);
  const qtyInCart   = cartItem?.quantity || 0;

  const handleDecrease = (e) => {
    e.preventDefault();
    if (qtyInCart <= 1) onRemove(item._id);
    else onUpdate(item._id, qtyInCart - 1);
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    onUpdate(item._id, qtyInCart + 1);
  };

  return (
    <Link to={`/produce/${item._id}`} className={styles.card}>
      <div className={styles.cardImgWrap}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className={styles.cardImg} />
        ) : (
          <div className={styles.cardImgPlaceholder}>No image</div>
        )}
        {item.isImperfect && (
          <span className={styles.imperfectBadge}>Imperfect</span>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTags}>
          <span className={styles.qualityTag}>{item.quality}</span>
          {item.shelfLife && <span className={styles.shelfTag}>🕐 {item.shelfLife}</span>}
        </div>
        <h3 className={styles.cardName}>{item.name}</h3>
        <p className={styles.cardFarmer}>🌾 {farmerName}{farmerCity ? ` · ${farmerCity}` : ''}</p>
        <p className={styles.cardStock}>{item.quantity} {item.unit} available</p>
        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>₹{item.price} <span>/{item.unit}</span></span>

          {qtyInCart > 0 ? (
            <div className={styles.qtyControls} onClick={e => e.preventDefault()}>
              <button
                className={styles.qtyBtn}
                onClick={handleDecrease}
              >−</button>
              <span className={styles.qtyNum}>{qtyInCart}</span>
              <button
                className={styles.qtyBtn}
                onClick={handleIncrease}
              >+</button>
            </div>
          ) : (
            <button
              className={styles.addBtn}
              onClick={(e) => { e.preventDefault(); onAdd(item, item.name); }}
            >+</button>
          )}
        </div>
      </div>
    </Link>
  );
}