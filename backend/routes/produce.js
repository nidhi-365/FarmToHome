import express from 'express';
import { protect, farmerOnly } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import Produce from '../models/Produce.js';

const router = express.Router();

// Get all public produce (with filtering, sorting, pagination)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page  = 1,
      limit = 12,
    } = req.query;

    // Build query
    let query = { isListed: true, quantity: { $gt: 0 } };
    if (category) query.category = category;
    if (search)   query.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort options
    const sortMap = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      newest:     { createdAt: -1 },
    };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    // Pagination
    const skip       = (Number(page) - 1) * Number(limit);
    const total      = await Produce.countDocuments(query);
    const totalPages = Math.ceil(total / Number(limit));

    const produce = await Produce.find(query)
      .populate('farmer', 'name farmName address')
      .sort(sortOpt)
      .skip(skip)
      .limit(Number(limit));

    // Return shape the frontend expects: { produce, totalPages }
    res.json({ produce, totalPages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all produce for logged-in farmer
router.get('/my', protect, farmerOnly, async (req, res) => {
  try {
    const produces = await Produce.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.json(produces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get imperfect produce listings
router.get('/imperfect', protect, farmerOnly, async (req, res) => {
  try {
    const items = await Produce.find({ farmer: req.user.id, isImperfect: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get disaster affected produce
router.get('/disaster', protect, farmerOnly, async (req, res) => {
  try {
    const items = await Produce.find({ farmer: req.user.id, disaster: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get produce by season
router.get('/season/:season', protect, farmerOnly, async (req, res) => {
  try {
    const items = await Produce.find({
      farmer: req.user.id,
      season: req.params.season
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new produce (with image upload)
router.post('/', protect, farmerOnly, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', err);
      return res.status(500).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const {
      name, category, quantity, unit, price,
      description, quality, shelfLife,
      season, disaster
    } = req.body;

    const isImperfect = quality === 'Imperfect';

    const produce = await Produce.create({
      farmer: req.user.id,
      name, category, quantity, unit, price,
      description, quality, shelfLife, isImperfect,
      season,
      disaster: disaster === 'true' || disaster === true,
      imageUrl: req.file?.path || '',
    });

    res.status(201).json(produce);
  } catch (err) {
    console.error('Produce create error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update produce
router.put('/:id', protect, farmerOnly, async (req, res) => {
  try {
    if (req.body.disaster !== undefined) {
      req.body.disaster = req.body.disaster === 'true' || req.body.disaster === true;
    }

    const produce = await Produce.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      req.body,
      { new: true }
    );
    if (!produce) return res.status(404).json({ message: 'Not found' });
    res.json(produce);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete produce
router.delete('/:id', protect, farmerOnly, async (req, res) => {
  try {
    await Produce.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single produce
router.get('/:id', async (req, res) => {
  try {
    const item = await Produce.findById(req.params.id).populate('farmer', 'name farmName location');
    if (!item) return res.status(404).json({ message: 'Produce not found' });;
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;