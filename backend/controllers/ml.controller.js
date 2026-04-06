import axios from 'axios';

const ML_URL = process.env.ML_API_URL || 'http://localhost:5001';

// @desc  Get recipe recommendations based on items in cart or custom list
// @route POST /api/ml/recipes
// @access Public
const getRecipes = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please provide a list of ingredients' });
    }

    // Forward to Python Flask server exactly as it expects
    const response = await axios.post(`${ML_URL}/recipe`, { items });

    // response.data is already the top-5 array from Flask:
    // [{ name, score, missing }, ...]
    res.json(response.data);
  } catch (error) {
    console.error('Recipe ML error:', error.message);
    res.status(500).json({ message: 'Recipe service unavailable. Is the ML server running?' });
  }
};

export { getRecipes };
