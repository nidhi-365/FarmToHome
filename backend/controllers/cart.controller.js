import Cart from '../models/Cart.js';
import Produce from '../models/Produce.js';

// @desc  Get cart for logged-in customer
// @route GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) cart = { items: [] };
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Add item to cart (or bump qty if already there)
// @route POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { produceId, quantity = 1 } = req.body;

    const item = await Produce.findById(produceId).populate('farmer', 'name');
    if (!item || !item.isListed) {
      return res.status(404).json({ message: 'Produce not available' });
    }
    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) cart = new Cart({ customer: req.user._id, items: [] });

    const idx = cart.items.findIndex(
      (i) => i.produce.toString() === produceId
    );

    if (idx >= 0) {
      cart.items[idx].quantity += Number(quantity);
    } else {
      cart.items.push({
        produce:    item._id,
        name:       item.name,
        imageUrl:   item.imageUrl,
        price:      item.price,
        unit:       item.unit,
        quantity:   Number(quantity),
        farmerName: item.farmer?.name || '',
        farmerId:   item.farmer?._id,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update quantity of a cart item
// @route PUT /api/cart/:produceId
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(
      (i) => i.produce.toString() === req.params.produceId
    );
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter(
        (i) => i.produce.toString() !== req.params.produceId
      );
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Remove one item from cart
// @route DELETE /api/cart/:produceId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(
      (i) => i.produce.toString() !== req.params.produceId
    );
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Clear entire cart
// @route DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ customer: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
