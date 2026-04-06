import express from 'express';
import {
  getCart, addToCart, updateCartItem, removeFromCart, clearCart,
} from '../controllers/cart.controller.js';
import { protect, customerOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, customerOnly);

router.get('/',               getCart);
router.post('/',              addToCart);
router.put('/:produceId',     updateCartItem);
router.delete('/:produceId',  removeFromCart);
router.delete('/',            clearCart);

export default router;
