import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, update } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:     user?.name             || '',
    phone:    user?.phone            || '',
    street:   user?.address?.street  || '',
    city:     user?.address?.city    || 'Bengaluru',
    state:    user?.address?.state   || 'Karnataka',
    pincode:  user?.address?.pincode || '',
    password: '',
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name:  form.name,
        phone: form.phone,
        address: {
          street:  form.street,
          city:    form.city,
          state:   form.state,
          pincode: form.pincode,
        },
        ...(form.password && { password: form.password }),
      };
      await update(payload);
      toast.success('Profile updated');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className={styles.name}>{user?.name}</h1>
            <p className={styles.email}>{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.sectionLabel}>Personal details</p>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Full name</label>
              <input name="name" className={styles.input} value={form.name} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone</label>
              <input name="phone" className={styles.input} value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <p className={styles.sectionLabel}>Delivery address</p>
          <div className={styles.field}>
            <label className={styles.label}>Street</label>
            <input name="street" className={styles.input} value={form.street} onChange={handleChange} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>City</label>
              <input name="city" className={styles.input} value={form.city} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>State</label>
              <input name="state" className={styles.input} value={form.state} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Pincode</label>
              <input name="pincode" className={styles.input} value={form.pincode} onChange={handleChange} />
            </div>
          </div>

          <p className={styles.sectionLabel}>Change password</p>
          <div className={styles.field}>
            <label className={styles.label}>New password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}