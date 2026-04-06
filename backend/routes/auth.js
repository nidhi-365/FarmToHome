import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Register ──────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'farmer', farmName, location, soilType, climate } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed, role,
      farmName, location, soilType, climate,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        phone:   user.phone   || '',
        address: user.address || { street: '', city: '', state: '', pincode: '' },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        phone:   user.phone   || '',
        address: user.address || { street: '', city: '', state: '', pincode: '' },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get profile ───────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update profile ────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name)    user.name  = name;
    if (phone)   user.phone = phone;
    if (address) user.address = { ...user.address.toObject?.() || {}, ...address };

    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      id:      user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      phone:   user.phone   || '',
      address: user.address || { street: '', city: '', state: '', pincode: '' },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;