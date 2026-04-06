import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Produce from '../models/Produce.js';

// @desc  Place order from cart
// @route POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod = 'cod' } = req.body;
    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = [];
    let totalAmount  = 0;

    for (const item of cart.items) {
      const produce = await Produce.findById(item.produce).populate('farmer', 'name');
      if (!produce || !produce.isListed || produce.quantity < item.quantity) {
        return res.status(400).json({
          message: `${item.name} is no longer available in the requested quantity`,
        });
      }

      orderItems.push({
        produce:    produce._id,
        name:       produce.name,
        imageUrl:   produce.imageUrl,
        price:      produce.price,
        unit:       produce.unit,
        quantity:   item.quantity,
        farmerName: produce.farmer?.name || '',
        farmerId:   produce.farmer?._id,
      });

      totalAmount += produce.price * item.quantity;

      // Deduct stock
      produce.quantity -= item.quantity;
      produce.sold     += item.quantity;
      await produce.save();
    }

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
    });

    await Cart.findOneAndDelete({ customer: req.user._id });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all orders for logged-in customer
// @route GET /api/orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single order
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Cancel an order (only if pending)
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel — order is ${order.status}` });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Produce.findByIdAndUpdate(item.produce, {
        $inc: { quantity: item.quantity, sold: -item.quantity },
      });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all orders containing this farmer's produce
// @route GET /api/orders/farmer/incoming
const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const orders = await Order.find({ 'items.farmerId': farmerId })
      .sort({ createdAt: -1 })
      .populate('customer', 'name email phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update order status (farmer only)
// @route PATCH /api/orders/:id/status
const VALID_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['out_for_delivery'],
  out_for_delivery: ['delivered'],
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const farmerId = req.user.id;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Ensure this farmer actually has items in the order
    const hasFarmerItems = order.items.some(i => i.farmerId?.toString() === farmerId.toString());
    if (!hasFarmerItems) return res.status(403).json({ message: 'Not authorised' });

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({ message: `Cannot move from '${order.status}' to '${status}'` });
    }

    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { placeOrder, getMyOrders, getOrderById, cancelOrder, getFarmerOrders, updateOrderStatus };