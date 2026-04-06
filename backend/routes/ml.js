import express from 'express';
const router = express.Router();
import { getRecipes } from '../controllers/ml.controller.js';

// POST /api/ml/recipes
// body: { "items": ["potato", "onion", "tomato"] }
// returns: top 5 recipes [{ name, score, missing }]
router.post('/recipes', getRecipes);

export default router;
