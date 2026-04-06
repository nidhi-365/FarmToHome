import express from 'express';
const router = express.Router();
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getFarmerOrders,
  updateOrderStatus,
  streamOrderStatus,
} from '../controllers/order.controller.js';
import { protect, customerOnly, farmerOnly } from '../middleware/auth.js';

// Customer routes
router.post('/',               protect, customerOnly, placeOrder);
router.get('/',                protect, customerOnly, getMyOrders);
router.get('/:id/live',        protect, customerOnly, streamOrderStatus); // SSE — must be before /:id
router.get('/:id',             protect, customerOnly, getOrderById);
router.put('/:id/cancel',      protect, customerOnly, cancelOrder);

// Farmer routes
router.get('/farmer/incoming', protect, farmerOnly, getFarmerOrders);
router.patch('/:id/status',    protect, farmerOnly, updateOrderStatus);

export default router;