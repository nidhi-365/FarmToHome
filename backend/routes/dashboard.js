import express from 'express';
import { protect, farmerOnly } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Produce from '../models/Produce.js';

const router = express.Router();

router.get('/', protect, farmerOnly, async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Bug 1 fix: query by items.farmerId (Order has no top-level farmer field)
    const orders = await Order.find({ 'items.farmerId': farmerId });
    const produce = await Produce.find({ farmer: farmerId });

    // Bug 2 fix: use totalAmount (not totalPrice) and lowercase status values
    // Revenue = sum of only THIS farmer's items in each order (not the whole order total)
    const deliveredOrders = orders.filter(o => o.status === 'delivered');

    const farmerItemsRevenue = (orderList) =>
      orderList.reduce((sum, o) => {
        const farmerItems = o.items.filter(i => i.farmerId?.toString() === farmerId.toString());
        return sum + farmerItems.reduce((s, i) => s + i.price * i.quantity, 0);
      }, 0);

    const totalRevenue = farmerItemsRevenue(deliveredOrders);

    // Imperfect sold: cross-reference with produce records
    const imperfectProduceIds = new Set(
      produce.filter(p => p.isImperfect).map(p => p._id.toString())
    );
    const imperfectSold = deliveredOrders.reduce((sum, o) => {
      const farmerItems = o.items.filter(i => i.farmerId?.toString() === farmerId.toString());
      return sum + farmerItems
        .filter(i => imperfectProduceIds.has(i.produce?.toString()))
        .reduce((s, i) => s + i.quantity, 0);
    }, 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    // Monthly revenue for chart
    const monthlyRevenue = {};
    deliveredOrders.forEach(order => {
      const month = new Date(order.updatedAt).toLocaleString('default', { month: 'short' });
      const farmerItems = order.items.filter(i => i.farmerId?.toString() === farmerId.toString());
      const amount = farmerItems.reduce((s, i) => s + i.price * i.quantity, 0);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + amount;
    });

    // Top selling produce — per-item stats from delivered orders
    const produceStats = produce.map(p => {
      let sold = 0, revenue = 0;
      deliveredOrders.forEach(o => {
        const match = o.items.find(i => i.produce?.toString() === p._id.toString());
        if (match) {
          sold    += match.quantity;
          revenue += match.price * match.quantity;
        }
      });
      return { name: p.name, sold, revenue, isImperfect: p.isImperfect };
    }).sort((a, b) => b.sold - a.sold).slice(0, 5);

    // Only count active listings
    const totalListings = produce.filter(p => p.isListed).length;

    res.json({
      totalRevenue,
      imperfectSold,
      totalOrders,
      pendingOrders,
      totalListings,
      monthlyRevenue,
      produceStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;